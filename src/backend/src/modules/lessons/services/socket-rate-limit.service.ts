import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

@Injectable()
export class SocketRateLimitService {
  private readonly logger = new Logger(SocketRateLimitService.name);
  private readonly rateLimitMap = new Map<string, RateLimitEntry>();

  private readonly windowMs: number =
    parseInt(process.env.SOCKET_RATE_LIMIT_WINDOW_MS || '900000', 10) || 900000; 
  private readonly maxRequests: number =
    parseInt(process.env.SOCKET_RATE_LIMIT_MAX || '100', 10) || 100;
  private readonly maxConnectionsPerUser: number =
    parseInt(process.env.SOCKET_MAX_CONNECTIONS_PER_USER || '5', 10) || 5;
  private readonly blockDurationMs: number = 60000;

  private readonly userConnections = new Map<string, Set<string>>();

  canConnect(socket: Socket, userId?: string): {
    allowed: boolean;
    reason?: string;
  } {
    const identifier = userId || socket.handshake.address || socket.id;

    const entry = this.rateLimitMap.get(identifier);
    if (entry?.blocked && entry.blockUntil && Date.now() < entry.blockUntil) {
      this.logger.warn(
        `Blocked connection attempt from ${identifier} (blocked until ${new Date(entry.blockUntil).toISOString()})`,
      );
      return {
        allowed: false,
        reason: 'Connection blocked due to rate limit violations',
      };
    }

    if (userId) {
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }

      const connections = this.userConnections.get(userId)!;
      if (connections.size >= this.maxConnectionsPerUser) {
        this.logger.warn(
          `User ${userId} exceeded max connections limit (${this.maxConnectionsPerUser})`,
        );
        return {
          allowed: false,
          reason: 'Maximum connections per user exceeded',
        };
      }

      connections.add(socket.id);
    }

    return { allowed: true };
  }

  canSendMessage(socket: Socket, userId?: string): {
    allowed: boolean;
    reason?: string;
  } {
    const identifier = userId || socket.handshake.address || socket.id;
    const now = Date.now();

    let entry = this.rateLimitMap.get(identifier);

    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
        blocked: false,
      };
      this.rateLimitMap.set(identifier, entry);
    }

    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.windowMs;
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded. Please try again later.',
      };
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + this.blockDurationMs;
      this.logger.warn(
        `Rate limit exceeded for ${identifier}. Blocking for ${this.blockDurationMs}ms`,
      );
      return {
        allowed: false,
        reason: 'Rate limit exceeded. Please try again later.',
      };
    }

    return { allowed: true };
  }

  removeConnection(socketId: string, userId?: string): void {
    if (userId) {
      const connections = this.userConnections.get(userId);
      if (connections) {
        connections.delete(socketId);
        if (connections.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }
  }

  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (
        now > entry.resetTime &&
        (!entry.blocked || (entry.blockUntil && now > entry.blockUntil))
      ) {
        this.rateLimitMap.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }
}

