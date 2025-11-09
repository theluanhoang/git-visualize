import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as FacebookPassportStrategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { OAuthUserInfoDto } from '../dto/oauth.dto';
import { OAuthProviderType } from 'src/modules/users/oauth.interface';
import { OAuthProfile } from '../../../shared/types/auth.types';

@Injectable()
export class FacebookOAuthStrategy extends PassportStrategy(FacebookPassportStrategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('oauth.facebook.clientId');
    const clientSecret = configService.get<string>('oauth.facebook.clientSecret');
    const callbackURL = configService.get<string>('oauth.facebook.callbackUrl');
    
    if (!clientId || !clientSecret || !callbackURL) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'dummy',
        profileFields: ['id', 'emails', 'name', 'picture'],
      });
      return;
    }
    
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      profileFields: ['id', 'emails', 'name', 'picture'],
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
    const { emails, name, photos } = profile;
    
    const userInfo: OAuthUserInfoDto = {
      email: emails?.[0]?.value, // do not fabricate email
      name: name ? `${name.givenName} ${name.familyName}` : profile.id,
      avatar: photos?.[0]?.value,
      providerId: profile.id,
      provider: OAuthProviderType.FACEBOOK,
      accessToken,
      refreshToken,
      locale: req.query?.locale || 'en',
    };

    done(null, userInfo);
  }
}
