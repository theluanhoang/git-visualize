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
    @MessageBody() data: { paymentId?: string; userId?: string },
  ) {
    // Support both paymentId (legacy) and userId (new pattern)
    const paymentId = data?.paymentId;
    const userId = data?.userId || client.userId;

    // If userId is provided or available from client, use PAYMENT:userId pattern
    if (userId && typeof userId === 'string') {
      try {
        const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
        if (sanitizedUserId !== userId) {
          client.emit('error', {
            message: 'Invalid userId format',
            code: 'INVALID_USER_ID',
          });
          return { success: false, userId };
        }

        const room = `PAYMENT:${userId}`;
        client.join(room);
        this.logger.log(
          `[PaymentGateway] Client ${client.id} (User: ${client.userId}) subscribed to payment room ${room}`,
        );
        return { success: true, userId };
      } catch (error) {
        this.logger.error(
          `Error subscribing client ${client.id} to payment room for user ${userId}: ${error.message}`,
        );
        client.emit('error', {
          message: 'Failed to subscribe payment',
          code: 'SUBSCRIBE_PAYMENT_FAILED',
        });
        return { success: false, userId };
      }
    }

    // Legacy support: paymentId pattern
    if (paymentId && typeof paymentId === 'string') {
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
          `[PaymentGateway] Client ${client.id} (User: ${client.userId}) subscribed to payment room ${room} (legacy)`,
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

    client.emit('error', {
      message: 'Invalid request: either userId or paymentId is required',
      code: 'INVALID_REQUEST',
    });
    return { success: false };
  }

  @SubscribeMessage('unsubscribe-payment')
  handleUnsubscribePayment(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { paymentId?: string; userId?: string },
  ) {
    // Support both paymentId (legacy) and userId (new pattern)
    const paymentId = data?.paymentId;
    const userId = data?.userId || client.userId;

    // If userId is provided or available from client, use PAYMENT:userId pattern
    if (userId && typeof userId === 'string') {
      const room = `PAYMENT:${userId}`;
      try {
        client.leave(room);
        this.logger.log(
          `[PaymentGateway] Client ${client.id} (User: ${client.userId}) unsubscribed from payment room ${room}`,
        );
        return { success: true, userId };
      } catch (error) {
        this.logger.error(
          `Error unsubscribing client ${client.id} from payment room for user ${userId}: ${error.message}`,
        );
        return { success: false, userId };
      }
    }

    // Legacy support: paymentId pattern
    if (paymentId && typeof paymentId === 'string') {
      const room = `payment:${paymentId}`;
      try {
        client.leave(room);
        this.logger.log(
          `[PaymentGateway] Client ${client.id} (User: ${client.userId}) unsubscribed from payment room ${room} (legacy)`,
        );
        return { success: true, paymentId };
      } catch (error) {
        this.logger.error(
          `Error unsubscribing client ${client.id} from payment ${paymentId}: ${error.message}`,
        );
        return { success: false, paymentId };
      }
    }

    return { success: false };
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
        
        // Log payload để debug
        this.logger.log(`[PaymentGateway] JWT payload decoded`, {
          socketId: client.id,
          payload: {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            iat: payload.iat,
            exp: payload.exp,
          },
          timestamp: new Date().toISOString(),
        });
        
        const userId = payload.sub;

        if (!userId) {
          this.logger.error(`[PaymentGateway] Invalid token payload: missing sub`, {
            socketId: client.id,
            payload,
            timestamp: new Date().toISOString(),
          });
          throw new Error('Invalid token payload: missing sub');
        }

        this.logger.log(`[PaymentGateway] User authenticated`, {
          socketId: client.id,
          userId,
          tokenSub: payload.sub,
          timestamp: new Date().toISOString(),
        });

        client.userId = userId;
        if (!client.data) {
          client.data = {} as any;
        }
        client.data.userId = userId;

        // Join user's personal room
        const userRoom = `user:${userId}`;
        // Also join PAYMENT:userId room automatically when connecting
        const paymentRoom = `PAYMENT:${userId}`;
        
        this.logger.log(`[PaymentGateway] Attempting to join user to rooms`, {
          socketId: client.id,
          userId,
          userRoom,
          paymentRoom,
          timestamp: new Date().toISOString(),
        });

        client.join(userRoom);
        client.join(paymentRoom);

        // CRITICAL FIX: Verify room membership immediately and use async check
        const rooms = Array.from(client.rooms);
        const isInUserRoom = client.rooms.has(userRoom);
        const isInPaymentRoom = client.rooms.has(paymentRoom);

        // Use async adapter check to verify room membership
        // Socket.io join() is synchronous, but adapter might need a tick
        void (async (): Promise<void> => {
          // Wait a bit for adapter to sync
          await new Promise<void>((resolve) => setTimeout(resolve, 50));

          const adapter = this.server.adapter;
          let socketCountInUserRoom = 0;
          let socketCountInPaymentRoom = 0;
          let verifiedInUserRoom = client.rooms.has(userRoom);
          let verifiedInPaymentRoom = client.rooms.has(paymentRoom);

          try {
            // Try to verify via adapter
            if (adapter && typeof adapter === 'object') {
              // Try fetchSockets for accurate count (Socket.IO v4+)
              if (typeof (adapter as any).fetchSockets === 'function') {
                try {
                  const userRoomSockets = await (adapter as any).fetchSockets({
                    rooms: new Set([userRoom]),
                  });
                  socketCountInUserRoom = userRoomSockets ? userRoomSockets.length : 0;
                  verifiedInUserRoom = socketCountInUserRoom > 0;
                  
                  const paymentRoomSockets = await (adapter as any).fetchSockets({
                    rooms: new Set([paymentRoom]),
                  });
                  socketCountInPaymentRoom = paymentRoomSockets ? paymentRoomSockets.length : 0;
                  verifiedInPaymentRoom = socketCountInPaymentRoom > 0;
                } catch {
                  // Fallback to rooms check
                }
              }

              // Fallback: check adapter.rooms
              if ((socketCountInUserRoom === 0 || socketCountInPaymentRoom === 0) && 'rooms' in adapter) {
                const adapterRooms = (adapter as any).rooms;
                if (
                  adapterRooms &&
                  typeof adapterRooms.get === 'function'
                ) {
                  const userRoomSockets = adapterRooms.get(userRoom);
                  socketCountInUserRoom = userRoomSockets ? userRoomSockets.size : 0;
                  verifiedInUserRoom = socketCountInUserRoom > 0;
                  
                  const paymentRoomSockets = adapterRooms.get(paymentRoom);
                  socketCountInPaymentRoom = paymentRoomSockets ? paymentRoomSockets.size : 0;
                  verifiedInPaymentRoom = socketCountInPaymentRoom > 0;
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
              userRoom,
              paymentRoom,
              isInUserRoom: verifiedInUserRoom,
              isInPaymentRoom: verifiedInPaymentRoom,
              socketCountInUserRoom,
              socketCountInPaymentRoom,
              timestamp: new Date().toISOString(),
            },
          );

          if (!verifiedInUserRoom) {
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
          
          if (!verifiedInPaymentRoom) {
            this.logger.warn(
              `⚠️ Socket ${client.id} may not have joined room ${paymentRoom} for user ${userId}`,
            );
            // Try to rejoin
            try {
              client.join(paymentRoom);
              this.logger.log(
                `Rejoined socket ${client.id} to room ${paymentRoom}`,
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
          userRoom,
          paymentRoom,
          isInUserRoom,
          isInPaymentRoom,
          allRooms: rooms,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });

        // Also log to console for easier debugging
        console.log(
          `[PaymentGateway] Socket ${client.id} connected for user ${userId}, joined rooms ${userRoom} and ${paymentRoom}`,
        );

        if (!isInUserRoom || !isInPaymentRoom) {
          this.logger.warn(
            `⚠️ Socket ${client.id} may not have joined all rooms for user ${userId} (checking immediately after join)`,
            {
              isInUserRoom,
              isInPaymentRoom,
            },
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

    const userRoom = `user:${userId}`;
    const paymentRoom = `PAYMENT:${userId}`;
    const legacyPaymentRoom = `payment:${payment.id}`;
    const eventData = {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      subscriptionId: payment.subscriptionId,
    };

    this.logger.log(
      `[emitPaymentCompleted] Preparing to emit payment:completed event to rooms ${userRoom} and ${paymentRoom} for payment ${payment.id}`,
      {
        userId,
        paymentId: payment.id,
        userRoom,
        paymentRoom,
        eventData,
        timestamp: new Date().toISOString(),
      },
    );
    console.log(
      `[PaymentGateway] 🔔 Emitting payment:completed to rooms ${userRoom} and ${paymentRoom} for user ${userId}, payment ${payment.id}`,
      {
        userId,
        paymentId: payment.id,
        userRoom,
        paymentRoom,
        eventData,
        timestamp: new Date().toISOString(),
      },
    );

    try {
      // In NestJS WebSocket Gateway with namespace, this.server is already the namespace server
      // So we can use it directly without calling .of()

      // Check if rooms exist and have sockets
      // Try multiple methods to detect sockets in the rooms
      const adapter = this.server.adapter;
      let socketCount = 0;
      let allRooms: string[] = [];

      try {
        // Method 1: Try adapter.rooms (works with most adapters)
        if (adapter && typeof adapter === 'object' && 'rooms' in adapter) {
          const rooms = (adapter as any).rooms;
          if (rooms && typeof rooms.get === 'function') {
            // Check both userRoom and paymentRoom
            const userRoomSockets = rooms.get(userRoom);
            const paymentRoomSockets = rooms.get(paymentRoom);
            const userRoomCount = userRoomSockets ? userRoomSockets.size : 0;
            const paymentRoomCount = paymentRoomSockets ? paymentRoomSockets.size : 0;
            socketCount = Math.max(userRoomCount, paymentRoomCount);
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
                const userRoomSockets = rooms.get(userRoom);
                const paymentRoomSockets = rooms.get(paymentRoom);
                const userRoomCount = userRoomSockets ? userRoomSockets.size : 0;
                const paymentRoomCount = paymentRoomSockets ? paymentRoomSockets.size : 0;
                const count = Math.max(userRoomCount, paymentRoomCount);
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
        `[emitPaymentCompleted] Rooms ${userRoom} and ${paymentRoom} have ${socketCount} socket(s) in /payments namespace`,
        {
          userId,
          paymentId: payment.id,
          userRoom,
          paymentRoom,
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
            targetUserRoom: userRoom,
            targetPaymentRoom: paymentRoom,
            targetUserId: userId,
            timestamp: new Date().toISOString(),
          },
        );
      }

      if (socketCount === 0) {
        this.logger.warn(
          `⚠️ [emitPaymentCompleted] No sockets in rooms ${userRoom} or ${paymentRoom} for user ${userId}. Event will not be delivered.`,
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

      // Always emit the event to the rooms in the /payments namespace
      // Even if socketCount is 0, because the adapter check might be unreliable
      this.logger.log(
        `[emitPaymentCompleted] Emitting event 'payment:completed' to rooms ${userRoom}, ${paymentRoom}, and ${legacyPaymentRoom} with data:`,
        {
          userId,
          paymentId: payment.id,
          userRoom,
          paymentRoom,
          legacyPaymentRoom,
          eventData,
          socketCount,
          timestamp: new Date().toISOString(),
        },
      );
      this.logger.log(`Event data: ${JSON.stringify(eventData, null, 2)}`);

      // CRITICAL FIX: Use both methods to ensure event is delivered
      // Method 1: Emit to rooms (standard way)
      // Emit to user room (for backward compatibility)
      this.server.to(userRoom).emit('payment:completed', eventData);
      // Emit to PAYMENT:userId room (new pattern)
      this.server.to(paymentRoom).emit('payment:completed', eventData);
      // Emit to legacy payment:paymentId room (for backward compatibility)
      this.server.to(legacyPaymentRoom).emit('payment:completed', eventData);
      
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
        `[emitPaymentCompleted] Event 'payment:completed' emitted to rooms ${userRoom}, ${paymentRoom}, and ${legacyPaymentRoom}`,
        {
          userId,
          paymentId: payment.id,
          userRoom,
          paymentRoom,
          legacyPaymentRoom,
          timestamp: new Date().toISOString(),
        },
      );

      const success = socketCount > 0;
      if (success) {
        this.logger.log(
          `✅ [emitPaymentCompleted] Successfully emitted payment:completed event to user ${userId} for payment ${payment.id} (${socketCount} socket(s) in rooms)`,
          {
            userId,
            paymentId: payment.id,
            userRoom,
            paymentRoom,
            socketCount,
            eventData,
            timestamp: new Date().toISOString(),
          },
        );
        console.log(
          `[PaymentGateway] ✅ Event emitted successfully to rooms ${userRoom} and ${paymentRoom} (${socketCount} socket(s))`,
          {
            userId,
            paymentId: payment.id,
            userRoom,
            paymentRoom,
            socketCount,
            eventData,
            timestamp: new Date().toISOString(),
          },
        );
      } else {
        this.logger.warn(
          `⚠️ [emitPaymentCompleted] Emitted event to rooms ${userRoom} and ${paymentRoom} but no sockets were detected. Event may not be delivered.`,
          {
            userId,
            paymentId: payment.id,
            userRoom,
            paymentRoom,
            socketCount: 0,
            allRooms,
            eventData,
            timestamp: new Date().toISOString(),
          },
        );
        console.log(
          `[PaymentGateway] ⚠️ Event emitted to rooms ${userRoom} and ${paymentRoom} but no sockets detected`,
          {
            userId,
            paymentId: payment.id,
            userRoom,
            paymentRoom,
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
    const paymentRoom = `PAYMENT:${userId}`;
    const legacyPaymentRoom = `payment:${payment.id}`;
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
    this.server.to(legacyPaymentRoom).emit('payment:status-updated', {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
    });
    this.logger.log(
      `Emitted payment:status-updated event to user ${userId} and rooms ${paymentRoom} and ${legacyPaymentRoom} for payment ${payment.id}`,
    );
  }
}
