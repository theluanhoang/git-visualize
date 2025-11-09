import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  data: {
    userId?: string;
    [key: string]: any;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();

      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token?.toString() ||
        null;

      if (!token) {
        this.logger.warn(`Unauthorized connection attempt from ${client.id}`);
        throw new WsException('Unauthorized: No token provided');
      }

      try {
        const secret = this.configService.get<string>('auth.jwtAccessSecret');
        const payload = this.jwtService.verify(token, { secret });

        const userId = payload.sub || payload.userId;
        if (!userId) {
          throw new WsException('Unauthorized: Invalid token payload');
        }

        client.userId = userId;
        if (!client.data) {
          client.data = {} as any;
        }
        client.data.userId = userId;

        this.logger.debug(`Authenticated socket ${client.id} for user ${userId}`);
        return true;
      } catch (error) {
        if (error instanceof WsException) {
          throw error;
        }
        this.logger.warn(
          `Invalid token for socket ${client.id}: ${error.message}`,
        );
        throw new WsException('Unauthorized: Invalid token');
      }
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      this.logger.error(`Error in WsJwtGuard: ${error.message}`);
      throw new WsException('Unauthorized');
    }
  }
}

