import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  data: {
    userId?: string;
    [key: string]: any;
  };
}

const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim());
  }
  return process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://localhost:3001'];
};

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/payments',
  maxHttpBufferSize: 1e6,
  pingTimeout: 60000,
  pingInterval: 25000,
  perMessageDeflate: false,
})
@Injectable()
export class PaymentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @SubscribeMessage('subscribe-payment')
  handleSubscribePayment(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { paymentId?: string },
  ) {
    const paymentId = data?.paymentId;
    if (!paymentId || typeof paymentId !== 'string') {
      client.emit('error', {
        message: 'Invalid paymentId',
        code: 'INVALID_PAYMENT_ID',
      });
      return { success: false, paymentId };
    }

    const sanitizedPaymentId = paymentId.replace(/[^a-zA-Z0-9-]/g, '');
    if (sanitizedPaymentId !== paymentId) {
      client.emit('error', {
        message: 'Invalid paymentId format',
        code: 'INVALID_PAYMENT_ID',
      });
      return { success: false, paymentId };
    }

    try {
      const room = `payment:${paymentId}`;
      client.join(room);
      this.logger.log(
        `[PaymentGateway] Client ${client.id} (User: ${client.userId}) subscribed to payment room ${room}`,
      );
      return { success: true, paymentId };
    } catch (error) {
      this.logger.error(
        `Error subscribing client ${client.id} to payment ${paymentId}: ${error.message}`,
      );
      client.emit('error', {
        message: 'Failed to subscribe payment',
        code: 'SUBSCRIBE_PAYMENT_FAILED',
      });
      return { success: false, paymentId };
    }
  }

  @SubscribeMessage('unsubscribe-payment')
  handleUnsubscribePayment(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { paymentId?: string },
  ) {
    const paymentId = data?.paymentId;
    if (!paymentId || typeof paymentId !== 'string') {
      return { success: false, paymentId };
    }

    const room = `payment:${paymentId}`;
    try {
      client.leave(room);
      this.logger.log(
        `[PaymentGateway] Client ${client.id} (User: ${client.userId}) unsubscribed from payment room ${room}`,
      );
      return { success: true, paymentId };
    } catch (error) {
      this.logger.error(
        `Error unsubscribing client ${client.id} from payment ${paymentId}: ${error.message}`,
      );
      return { success: false, paymentId };
    }
  }

  async handleConnection(client: AuthenticatedSocket) {
    const ip = client.handshake.address;
    const userAgent = client.handshake.headers['user-agent'] || 'unknown';

    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token?.toString() ||
        null;

      if (!token) {
        this.logger.warn(
          `Unauthorized connection attempt from ${ip} (${client.id})`,
        );
        client.emit('error', {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        client.disconnect();
        return;
      }

      try {
        const secret = this.configService.get<string>('auth.jwtAccessSecret');
        const payload = this.jwtService.verify(token, { secret });
        const userId = payload.sub || payload.userId;

        if (!userId) {
          throw new Error('Invalid token payload: missing userId');
        }

        client.userId = userId;
        if (!client.data) {
          client.data = {} as any;
        }
        client.data.userId = userId;

        // Join user's personal room
        const userRoom = `user:${userId}`;
        this.logger.log(`[PaymentGateway] Attempting to join user to room`, {
          socketId: client.id,
          userId,
          room: userRoom,
          timestamp: new Date().toISOString(),
        });

        client.join(userRoom);

        // CRITICAL FIX: Verify room membership immediately and use async check
        const rooms = Array.from(client.rooms);
        const isInRoom = client.rooms.has(userRoom);

        // Use async adapter check to verify room membership
        // Socket.io join() is synchronous, but adapter might need a tick
        void (async (): Promise<void> => {
          // Wait a bit for adapter to sync
          await new Promise<void>((resolve) => setTimeout(resolve, 50));

          const adapter = this.server.adapter;
          let socketCountInRoom = 0;
          let verifiedInRoom = client.rooms.has(userRoom);

          try {
            // Try to verify via adapter
            if (adapter && typeof adapter === 'object') {
              // Try fetchSockets for accurate count (Socket.IO v4+)
              if (typeof (adapter as any).fetchSockets === 'function') {
                try {
                  const sockets = await (adapter as any).fetchSockets({
                    rooms: new Set([userRoom]),
                  });
                  socketCountInRoom = sockets ? sockets.length : 0;
                  verifiedInRoom = socketCountInRoom > 0;
                } catch {
                  // Fallback to rooms check
                }
              }

              // Fallback: check adapter.rooms
              if (socketCountInRoom === 0 && 'rooms' in adapter) {
                const adapterRooms = (adapter as any).rooms;
                if (
                  adapterRooms &&
                  typeof adapterRooms.get === 'function'
                ) {
                  const roomSockets = adapterRooms.get(userRoom);
                  socketCountInRoom = roomSockets ? roomSockets.size : 0;
                  verifiedInRoom = socketCountInRoom > 0;
                }
              }
            }
          } catch (error) {
            this.logger.debug(`Could not verify room membership: ${error}`);
          }

          this.logger.log(
            `[PaymentGateway] Room membership verification (async)`,
            {
              socketId: client.id,
              userId,
              room: userRoom,
              isInRoom: verifiedInRoom,
              socketCountInRoom,
              timestamp: new Date().toISOString(),
            },
          );

          if (!verifiedInRoom) {
            this.logger.warn(
              `⚠️ Socket ${client.id} may not have joined room ${userRoom} for user ${userId}`,
            );
            // Try to rejoin
            try {
              client.join(userRoom);
              this.logger.log(
                `Rejoined socket ${client.id} to room ${userRoom}`,
              );
            } catch (rejoinError) {
              this.logger.error(`Failed to rejoin room: ${rejoinError}`);
            }
          }
        })().catch((error) => {
          this.logger.error(
            `Error in room membership verification: ${error}`,
          );
        });

        this.logger.log({
          event: 'payment_socket_connection',
          socketId: client.id,
          userId,
          room: userRoom,
          isInRoom,
          allRooms: rooms,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });

        // Also log to console for easier debugging
        console.log(
          `[PaymentGateway] Socket ${client.id} connected for user ${userId}, joined room ${userRoom}`,
        );

        if (!isInRoom) {
          this.logger.warn(
            `⚠️ Socket ${client.id} may not have joined room ${userRoom} for user ${userId} (checking immediately after join)`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Invalid token for client ${client.id} from ${ip}: ${error.message}`,
        );
        client.emit('error', {
          message: 'Invalid authentication token',
          code: 'INVALID_TOKEN',
        });
        client.disconnect();
        return;
      }
    } catch (error) {
      this.logger.error(
        `Error handling connection for ${client.id}: ${error.message}`,
      );
      client.emit('error', {
        message: 'Connection error',
        code: 'CONNECTION_ERROR',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log({
      event: 'payment_socket_disconnection',
      socketId: client.id,
      userId: client.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check if user has active socket connection
   */
  isUserConnected(userId: string): boolean {
    if (!this.server) {
      return false;
    }
    const room = `user:${userId}`;
    try {
      const adapter = this.server.adapter;
      if (adapter && typeof adapter === 'object' && 'rooms' in adapter) {
        const rooms = (adapter as any).rooms;
        if (rooms && typeof rooms.get === 'function') {
          const roomSockets = rooms.get(room);
          return roomSockets ? roomSockets.size > 0 : false;
        }
      }
    } catch (error) {
      this.logger.debug(`Could not check user connection: ${error}`);
    }
    return false;
  }

  /**
   * Emit payment completed event to user
   * @returns true if sockets were found in the room and event was emitted, false otherwise
   */
  async emitPaymentCompleted(userId: string, payment: any): Promise<boolean> {
    this.logger.log(
      `[emitPaymentCompleted] Called with userId: ${userId}, paymentId: ${payment.id}, payment.userId: ${payment.userId}`,
    );

    if (!this.server) {
      this.logger.error(
        `[emitPaymentCompleted] WebSocket server is not initialized. Cannot emit event for payment ${payment.id}`,
      );
      return false;
    }

    // Verify userId matches
    if (userId !== payment.userId) {
      this.logger.warn(
        `[emitPaymentCompleted] userId mismatch: provided userId=${userId}, payment.userId=${payment.userId}. Using payment.userId.`,
      );
      userId = payment.userId;
    }

    const room = `user:${userId}`;
    const paymentRoom = `payment:${payment.id}`;
    const eventData = {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      subscriptionId: payment.subscriptionId,
    };

    this.logger.log(
      `[emitPaymentCompleted] Preparing to emit payment:completed event to room ${room} for payment ${payment.id}`,
      {
        userId,
        paymentId: payment.id,
        room,
        eventData,
        timestamp: new Date().toISOString(),
      },
    );
    console.log(
      `[PaymentGateway] 🔔 Emitting payment:completed to room ${room} for user ${userId}, payment ${payment.id}`,
      {
        userId,
        paymentId: payment.id,
        room,
        eventData,
        timestamp: new Date().toISOString(),
      },
    );

    try {
      // In NestJS WebSocket Gateway with namespace, this.server is already the namespace server
      // So we can use it directly without calling .of()

      // Check if room exists and has sockets
      // Try multiple methods to detect sockets in the room
      const adapter = this.server.adapter;
      let socketCount = 0;
      let allRooms: string[] = [];

      try {
        // Method 1: Try adapter.rooms (works with most adapters)
        if (adapter && typeof adapter === 'object' && 'rooms' in adapter) {
          const rooms = (adapter as any).rooms;
          if (rooms && typeof rooms.get === 'function') {
            const roomSockets = rooms.get(room);
            socketCount = roomSockets ? roomSockets.size : 0;
          }
          if (rooms && typeof rooms.keys === 'function') {
            allRooms = Array.from(rooms.keys() as Iterable<string>);
          }
        }

        // Method 2: Try server.sockets.adapter (alternative API)
        if (
          socketCount === 0 &&
          this.server.sockets &&
          (this.server.sockets as any).adapter
        ) {
          try {
            const socketsAdapter = (this.server.sockets as any).adapter;
            if (socketsAdapter && socketsAdapter.rooms) {
              const rooms = socketsAdapter.rooms;
              if (rooms && typeof rooms.get === 'function') {
                const roomSockets = rooms.get(room);
                const count = roomSockets ? roomSockets.size : 0;
                if (count > 0) {
                  socketCount = count;
                }
              }
            }
          } catch {
            // Ignore, try next method
          }
        }

        // Method 3: Try to get sockets in room directly (socket.io v4+)
        // Note: fetchSockets() is async, but we can't use await here since this method is sync
        // So we'll skip this method and rely on the adapter methods above
      } catch (adapterError) {
        // If we can't access adapter info, just log and continue
        this.logger.debug(`Could not access adapter rooms: ${adapterError}`);
      }

      this.logger.log(
        `[emitPaymentCompleted] Room ${room} has ${socketCount} socket(s) in /payments namespace`,
        {
          userId,
          paymentId: payment.id,
          room,
          socketCount,
          allRooms,
          timestamp: new Date().toISOString(),
        },
      );

      // Log all connected users for debugging
      if (allRooms.length > 0) {
        const userRooms = allRooms.filter((r) => r.startsWith('user:'));
        this.logger.log(
          `[emitPaymentCompleted] Currently connected users in /payments namespace:`,
          {
            userRooms,
            targetRoom: room,
            targetUserId: userId,
            timestamp: new Date().toISOString(),
          },
        );
      }

      if (socketCount === 0) {
        this.logger.warn(
          `⚠️ [emitPaymentCompleted] No sockets in room ${room} for user ${userId}. Event will not be delivered.`,
        );
        if (allRooms.length > 0) {
          this.logger.debug(
            `Available rooms in /payments namespace: ${allRooms.join(', ')}`,
          );
        } else {
          this.logger.warn(
            `No rooms found in /payments namespace. Is anyone connected?`,
          );
        }
        // Still emit the event (in case adapter check failed but sockets exist)
        // But return false to indicate we didn't find sockets
      }

      // Always emit the event to the room in the /payments namespace
      // Even if socketCount is 0, because the adapter check might be unreliable
      this.logger.log(
        `[emitPaymentCompleted] Emitting event 'payment:completed' to room ${room} and ${paymentRoom} with data:`,
        {
          userId,
          paymentId: payment.id,
          room,
          paymentRoom,
          eventData,
          socketCount,
          timestamp: new Date().toISOString(),
        },
      );
      this.logger.log(`Event data: ${JSON.stringify(eventData, null, 2)}`);

      // CRITICAL FIX: Use both methods to ensure event is delivered
      // Method 1: Emit to room (standard way)
      this.server.to(room).emit('payment:completed', eventData);
      this.server.to(paymentRoom).emit('payment:completed', eventData);
      
      // Method 2: Also try to emit to all sockets in the namespace and filter by userId
      // This is a backup in case room joining had timing issues
      try {
        const sockets = await this.server.fetchSockets();
        const userSockets = sockets.filter((socket: any) => {
          return socket.data?.userId === userId || socket.userId === userId;
        });
        
        if (userSockets.length > 0) {
          this.logger.log(
            `[emitPaymentCompleted] Found ${userSockets.length} socket(s) for user ${userId} via fetchSockets, emitting directly`,
          );
          userSockets.forEach((socket: any) => {
            socket.emit('payment:completed', eventData);
          });
        }
      } catch (fetchError) {
        // fetchSockets might not be available in all Socket.IO versions
        this.logger.debug(`Could not use fetchSockets: ${fetchError}`);
      }

      this.logger.log(
        `[emitPaymentCompleted] Event 'payment:completed' emitted to room ${room}`,
        {
          userId,
          paymentId: payment.id,
          room,
          timestamp: new Date().toISOString(),
        },
      );

      const success = socketCount > 0;
      if (success) {
        this.logger.log(
          `✅ [emitPaymentCompleted] Successfully emitted payment:completed event to user ${userId} for payment ${payment.id} (${socketCount} socket(s) in room)`,
          {
            userId,
            paymentId: payment.id,
            room,
            socketCount,
            eventData,
            timestamp: new Date().toISOString(),
          },
        );
        console.log(
          `[PaymentGateway] ✅ Event emitted successfully to room ${room} (${socketCount} socket(s))`,
          {
            userId,
            paymentId: payment.id,
            room,
            socketCount,
            eventData,
            timestamp: new Date().toISOString(),
          },
        );
      } else {
        this.logger.warn(
          `⚠️ [emitPaymentCompleted] Emitted event to room ${room} but no sockets were detected. Event may not be delivered.`,
          {
            userId,
            paymentId: payment.id,
            room,
            socketCount: 0,
            allRooms,
            eventData,
            timestamp: new Date().toISOString(),
          },
        );
        console.log(
          `[PaymentGateway] ⚠️ Event emitted to room ${room} but no sockets detected`,
          {
            userId,
            paymentId: payment.id,
            room,
            allRooms,
            eventData,
            timestamp: new Date().toISOString(),
          },
        );
      }

      return success;
    } catch (error) {
      this.logger.error(
        `❌ [emitPaymentCompleted] Failed to emit payment:completed event for user ${userId}, payment ${payment.id}: ${error.message}`,
        error.stack,
      );
      // Don't throw - let webhook succeed even if WebSocket emit fails
      return false;
    }
  }

  /**
   * Emit payment status update to user
   */
  emitPaymentStatusUpdate(userId: string, payment: any) {
    const userRoom = `user:${userId}`;
    const paymentRoom = `payment:${payment.id}`;
    this.server.to(userRoom).emit('payment:status-updated', {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
    });
    this.server.to(paymentRoom).emit('payment:status-updated', {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
    });
    this.logger.log(
      `Emitted payment:status-updated event to user ${userId} and room ${paymentRoom} for payment ${payment.id}`,
    );
  }
}
