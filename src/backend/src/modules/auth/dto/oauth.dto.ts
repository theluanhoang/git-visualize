import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsUrl } from 'class-validator';
import { OAuthProviderType } from 'src/modules/users/oauth.interface';
import { EUserRole } from 'src/modules/users/user.interface';

export class OAuthCallbackDto {
  @ApiProperty({ description: 'Authorization code from OAuth provider' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'State parameter for CSRF protection' })
  @IsString()
  @IsOptional()
  state?: string;
}

export class OAuthUserInfoDto {
  @ApiProperty({ description: 'User email from OAuth provider' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User name from OAuth provider' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'User avatar URL from OAuth provider' })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'OAuth provider ID' })
  @IsString()
  providerId: string;

  @ApiProperty({ description: 'OAuth provider type' })
  @IsEnum(OAuthProviderType)
  provider: OAuthProviderType;

  @ApiProperty({ description: 'OAuth access token' })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiProperty({ description: 'OAuth refresh token' })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ApiProperty({ description: 'User locale' })
  @IsString()
  @IsOptional()
  locale?: string;
}

export class OAuthLoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: EUserRole;
  };

  @ApiProperty({ description: 'Whether this is a new user registration' })
  isNewUser: boolean;
}
