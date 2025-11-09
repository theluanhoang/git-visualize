import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { OAuthUserInfoDto } from '../dto/oauth.dto';
import { OAuthProviderType } from 'src/modules/users/oauth.interface';
import { OAuthProfile } from '../../../shared/types/auth.types';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('oauth.google.clientId');
    const clientSecret = configService.get<string>('oauth.google.clientSecret');
    const callbackURL = configService.get<string>('oauth.google.callbackUrl');
    
    if (!clientId || !clientSecret || !callbackURL) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'dummy',
        scope: ['email', 'profile'],
      });
      return;
    }
    
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: OAuthProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;
    
    const userInfo: OAuthUserInfoDto = {
      email: emails?.[0]?.value, 
      name: name?.givenName && name?.familyName 
        ? `${name.givenName} ${name.familyName}` 
        : name?.displayName || profile.id,
      avatar: photos?.[0]?.value,
      providerId: profile.id,
      provider: OAuthProviderType.GOOGLE,
      accessToken,
      refreshToken,
      locale: req.query?.locale || 'en',
    };

    done(null, userInfo);
  }
}
