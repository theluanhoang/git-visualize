import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GitHubPassportStrategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { OAuthUserInfoDto } from '../dto/oauth.dto';
import { OAuthProviderType } from 'src/modules/users/oauth.interface';
import { OAuthProfile } from '../../../shared/types/auth.types';

@Injectable()
export class GitHubOAuthStrategy extends PassportStrategy(GitHubPassportStrategy, 'github') {
  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('oauth.github.clientId');
    const clientSecret = configService.get<string>('oauth.github.clientSecret');
    const callbackURL = configService.get<string>('oauth.github.callbackUrl');
    
    if (!clientId || !clientSecret || !callbackURL) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'dummy',
        scope: ['user:email'],
      });
      return;
    }
    
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['user:email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: OAuthProfile,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    const { username, emails, photos, displayName } = profile;
    
    const userInfo: OAuthUserInfoDto = {
      email: emails?.[0]?.value, 
      name: displayName || username || profile.id,
      avatar: photos?.[0]?.value,
      providerId: profile.id,
      provider: OAuthProviderType.GITHUB,
      accessToken,
      refreshToken,
      locale: req.query?.locale || 'en',
    };

    done(null, userInfo);
  }
}
