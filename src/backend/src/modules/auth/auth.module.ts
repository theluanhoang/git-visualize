import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/user.entity';
import { OAuthProvider } from '../users/oauth-provider.entity';
import { Session } from '../sessions/session.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthController } from './oauth.controller';
import { SessionController } from '../sessions/session.controller';
import { OAuthService } from './oauth.service';
import { DeviceTrackingService } from './device-tracking.service';
import { UserModule } from '../users/user.module';
import { SessionModule } from '../sessions/session.module';
import { GoogleOAuthStrategy } from './strategies/google.strategy';
import { GitHubOAuthStrategy } from './strategies/github.strategy';
import { FacebookOAuthStrategy } from './strategies/facebook.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OAuthProvider, Session]),
    ConfigModule,
    PassportModule,
    UserModule,
    SessionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtAccessSecret') || 'default-secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController, OAuthController, SessionController],
  providers: [
    AuthService,
    OAuthService,
    DeviceTrackingService,
    GoogleOAuthStrategy,
    GitHubOAuthStrategy,
    FacebookOAuthStrategy,
    JwtStrategy,
  ],
  exports: [AuthService, OAuthService],
})
export class AuthModule {}


