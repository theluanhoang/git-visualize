import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { OAuthProvider } from '../users/oauth-provider.entity';
import { Session } from '../sessions/session.entity';
import { OAuthUserInfoDto, OAuthLoginResponseDto } from './dto/oauth.dto';
import { ConfigService } from '@nestjs/config';
import { DeviceTrackingService } from './device-tracking.service';
import * as argon2 from 'argon2';
import { SessionType } from '../sessions/session.interface';
import { EUserRole } from '../users/user.interface';
import { OAuthProviderType } from '../users/oauth.interface';

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OAuthProvider)
    private oauthProviderRepository: Repository<OAuthProvider>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private deviceTrackingService: DeviceTrackingService,
  ) { }

  async validateOAuthUser(userInfo: OAuthUserInfoDto, userAgent?: string, ip?: string): Promise<OAuthLoginResponseDto> {
    let oauthProvider = await this.oauthProviderRepository.findOne({
      where: {
        provider: userInfo.provider,
        providerId: userInfo.providerId,
      },
      relations: ['user'],
    });

    let user: User;
    let isNewUser = false;

    if (oauthProvider) {
      user = oauthProvider.user;

      oauthProvider.providerEmail = userInfo.email || '';
      oauthProvider.providerName = userInfo.name;
      oauthProvider.providerAvatar = userInfo.avatar;
      await this.oauthProviderRepository.save(oauthProvider);
    } else {
      const existingUser = userInfo.email
        ? await this.userRepository.findOne({
            where: { email: userInfo.email },
            relations: ['oauthProviders'],
          })
        : null;

      if (existingUser) {
        user = existingUser;
        oauthProvider = this.oauthProviderRepository.create({
          provider: userInfo.provider,
          providerId: userInfo.providerId,
          providerEmail: userInfo.email || '',
          providerName: userInfo.name,
          providerAvatar: userInfo.avatar,
          userId: user.id,
        });
        await this.oauthProviderRepository.save(oauthProvider);
      } else {
        isNewUser = true;
        user = this.userRepository.create({
          // Store a stable internal identifier when email is not provided by provider
          email: userInfo.email ?? `${userInfo.provider}:${userInfo.providerId}`,
          firstName: userInfo.name?.split(' ')[0],
          lastName: userInfo.name?.split(' ').slice(1).join(' '),
          avatar: userInfo.avatar,
          role: EUserRole.USER,
          isActive: true,
        });
        user = await this.userRepository.save(user);

        oauthProvider = this.oauthProviderRepository.create({
          provider: userInfo.provider,
          providerId: userInfo.providerId,
          providerEmail: userInfo.email || '',
          providerName: userInfo.name,
          providerAvatar: userInfo.avatar,
          userId: user.id,
        });
        await this.oauthProviderRepository.save(oauthProvider);
      }
    }

    const tokens = await this.generateTokens(user);

    const [oauthAccessTokenHash, oauthRefreshTokenHash] = await Promise.all([
      userInfo.accessToken ? argon2.hash(userInfo.accessToken, { type: argon2.argon2id }) : null,
      userInfo.refreshToken ? argon2.hash(userInfo.refreshToken, { type: argon2.argon2id }) : null,
    ]);

    const session = new Session();
    session.userId = user.id;
    session.refreshTokenHash = await argon2.hash(tokens.refreshToken, { type: argon2.argon2id });
    session.userAgent = userAgent || null;
    session.ip = ip || null;
    session.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    session.sessionType = SessionType.OAUTH;
    session.oauthProvider = userInfo.provider;
    session.oauthProviderId = userInfo.providerId;
    session.oauthAccessTokenHash = oauthAccessTokenHash || undefined;
    session.oauthRefreshTokenHash = oauthRefreshTokenHash || undefined;
    session.oauthTokenExpiresAt = userInfo.accessToken ? new Date(Date.now() + 60 * 60 * 1000) : undefined;

    const savedSession = await this.sessionRepository.save(session);

    if (userAgent && ip) {
      await this.deviceTrackingService.updateSessionWithDeviceInfo(
        savedSession.id,
        userAgent,
        ip
      );
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        // Only expose real email if provided by provider
        email: userInfo.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      },
      isNewUser,
    };
  }

  async validateOAuthConfiguration(provider: string): Promise<void> {
    const clientId = this.configService.get<string>(`oauth.${provider}.clientId`);
    const clientSecret = this.configService.get<string>(`oauth.${provider}.clientSecret`);
    
    if (!clientId || !clientSecret) {
      throw new BadRequestException(`${provider} OAuth is not configured`);
    }
  }

  async buildOAuthRedirectUrl(result: OAuthLoginResponseDto, locale: string = 'en'): Promise<string> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${frontendUrl}/${locale}/auth/callback?access_token=${result.accessToken}&refresh_token=${result.refreshToken}&is_new_user=${result.isNewUser}`;
  }

  async unlinkOAuthProviderWithValidation(userId: string, provider: string): Promise<{ message: string }> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.unlinkOAuthProvider(userId, provider.toUpperCase());
    return { message: 'OAuth provider unlinked successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessTokenSecret = this.configService.get<string>('auth.jwtAccessSecret');
    const refreshTokenSecret = this.configService.get<string>('auth.jwtRefreshSecret');
    const accessTtl = this.configService.get<string>('auth.accessTtl');
    const refreshTtl = this.configService.get<string>('auth.refreshTtl');

    if (!accessTokenSecret || !refreshTokenSecret || !accessTtl || !refreshTtl) {
      throw new Error('JWT configuration is missing');
    }

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload);

    return { accessToken, refreshToken };
  }

  async unlinkOAuthProvider(userId: string, provider: string): Promise<void> {
    const oauthProvider = await this.oauthProviderRepository.findOne({
      where: {
        userId,
        provider: provider.toUpperCase() as OAuthProviderType
      },
    });

    if (!oauthProvider) {
      throw new UnauthorizedException('OAuth provider not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['oauthProviders'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.passwordHash && user.oauthProviders.length <= 1) {
      throw new UnauthorizedException('Cannot unlink the only authentication method');
    }

    await this.oauthProviderRepository.remove(oauthProvider);
  }
}