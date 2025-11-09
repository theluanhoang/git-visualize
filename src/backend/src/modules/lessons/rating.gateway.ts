import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
  OnModuleDestroy,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { SocketRateLimitService } from './services/socket-rate-limit.service';
import {
  SubscribeLessonDto,
  UnsubscribeLessonDto,
} from './dto/socket-subscribe-lesson.dto';
import { SocketEvents } from './constants/socket-events.constants';

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
  namespace: '/ratings',
  maxHttpBufferSize: 1e6, 
  pingTimeout: 60000,
  pingInterval: 25000,
  perMessageDeflate: false,
})
export class RatingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RatingGateway.name);
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rateLimitService: SocketRateLimitService,
  ) {
    this.cleanupInterval = setInterval(() => {
      this.rateLimitService.cleanup();
    }, 15 * 60 * 1000);
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
        client.emit(SocketEvents.SERVER_TO_CLIENT.ERROR, {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        client.disconnect();
        return;
      }

      const canConnect = this.rateLimitService.canConnect(client);
      if (!canConnect.allowed) {
        this.logger.warn(
          `Connection blocked from ${ip} (${client.id}): ${canConnect.reason}`,
        );
        client.emit(SocketEvents.SERVER_TO_CLIENT.ERROR, {
          message: canConnect.reason || 'Connection blocked',
          code: 'CONNECTION_BLOCKED',
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

        const canConnectUser = this.rateLimitService.canConnect(client, userId);
        if (!canConnectUser.allowed) {
          this.logger.warn(
            `Connection blocked for user ${userId} (${client.id}): ${canConnectUser.reason}`,
          );
          client.emit(SocketEvents.SERVER_TO_CLIENT.ERROR, {
            message: canConnectUser.reason || 'Connection blocked',
            code: 'CONNECTION_BLOCKED',
          });
          client.disconnect();
          return;
        }

        this.logger.log({
          event: 'socket_connection',
          socketId: client.id,
          userId,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        this.logger.warn(
          `Invalid token for client ${client.id} from ${ip}: ${error.message}`,
        );
        client.emit(SocketEvents.SERVER_TO_CLIENT.ERROR, {
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
      client.emit(SocketEvents.SERVER_TO_CLIENT.ERROR, {
        message: 'Connection error',
        code: 'CONNECTION_ERROR',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.rateLimitService.removeConnection(client.id, client.userId);

    this.logger.log({
      event: 'socket_disconnection',
      socketId: client.id,
      userId: client.userId,
      reason: (client as any).disconnectReason || 'client_disconnect',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage(SocketEvents.CLIENT_TO_SERVER.SUBSCRIBE_LESSON)
  @UseGuards(WsJwtGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  handleSubscribeLesson(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SubscribeLessonDto,
  ) {
    const canSend = this.rateLimitService.canSendMessage(
      client,
      client.userId,
    );
    if (!canSend.allowed) {
      throw new WsException(canSend.reason || 'Rate limit exceeded');
    }

    const { lessonId } = data;

    if (!lessonId || typeof lessonId !== 'string') {
      throw new WsException('Invalid lessonId');
    }

    if (lessonId.length > 100) {
      throw new WsException('lessonId too long');
    }

    const sanitizedLessonId = lessonId.replace(/[^a-zA-Z0-9-]/g, '');
    if (sanitizedLessonId !== lessonId) {
      this.logger.warn(
        `Invalid characters in lessonId from client ${client.id}: ${lessonId}`,
      );
      throw new WsException('Invalid lessonId format');
    }

    try {
      client.join(`lesson:${lessonId}`);
      this.logger.log(
        `Client ${client.id} (User: ${client.userId}) subscribed to lesson ${lessonId}`,
      );
      return { success: true, lessonId };
    } catch (error) {
      this.logger.error(
        `Error subscribing client ${client.id} to lesson ${lessonId}: ${error.message}`,
      );
      throw new WsException('Failed to subscribe to lesson');
    }
  }

  @SubscribeMessage(SocketEvents.CLIENT_TO_SERVER.UNSUBSCRIBE_LESSON)
  @UseGuards(WsJwtGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  handleUnsubscribeLesson(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: UnsubscribeLessonDto,
  ) {
    const canSend = this.rateLimitService.canSendMessage(
      client,
      client.userId,
    );
    if (!canSend.allowed) {
      throw new WsException(canSend.reason || 'Rate limit exceeded');
    }

    const { lessonId } = data;

    if (!lessonId || typeof lessonId !== 'string' || lessonId.length > 100) {
      throw new WsException('Invalid lessonId');
    }

    const sanitizedLessonId = lessonId.replace(/[^a-zA-Z0-9-]/g, '');
    if (sanitizedLessonId !== lessonId) {
      throw new WsException('Invalid lessonId format');
    }

    try {
      client.leave(`lesson:${lessonId}`);
      this.logger.log(
        `Client ${client.id} (User: ${client.userId}) unsubscribed from lesson ${lessonId}`,
      );
      return { success: true, lessonId };
    } catch (error) {
      this.logger.error(
        `Error unsubscribing client ${client.id} from lesson ${lessonId}: ${error.message}`,
      );
      throw new WsException('Failed to unsubscribe from lesson');
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  emitRatingCreated(lessonId: string, rating: any) {
    this.server.to(`lesson:${lessonId}`).emit(SocketEvents.SERVER_TO_CLIENT.RATING_CREATED, {
      lessonId,
      rating,
    });
  }

  emitRatingUpdated(lessonId: string, rating: any) {
    this.server.to(`lesson:${lessonId}`).emit(SocketEvents.SERVER_TO_CLIENT.RATING_UPDATED, {
      lessonId,
      rating,
    });
  }

  emitRatingDeleted(lessonId: string, userId: string) {
    this.server.to(`lesson:${lessonId}`).emit(SocketEvents.SERVER_TO_CLIENT.RATING_DELETED, {
      lessonId,
      userId,
    });
  }

  emitStatsUpdated(lessonId: string, stats: any) {
    this.server.to(`lesson:${lessonId}`).emit(SocketEvents.SERVER_TO_CLIENT.STATS_UPDATED, {
      lessonId,
      stats,
    });
  }
}

