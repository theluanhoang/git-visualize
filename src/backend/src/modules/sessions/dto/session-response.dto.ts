import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { OAuthProviderType } from '../../users/oauth.interface';
import { SessionType } from '../session.interface';

export class SessionDetailsDto {
  @ApiProperty({ description: 'Session ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Session type', enum: SessionType })
  @IsEnum(SessionType)
  sessionType: SessionType;

  @ApiProperty({ description: 'OAuth provider', enum: OAuthProviderType, required: false })
  @IsOptional()
  @IsEnum(OAuthProviderType)
  oauthProvider?: OAuthProviderType;

  @ApiProperty({ description: 'OAuth provider ID', required: false })
  @IsOptional()
  @IsString()
  oauthProviderId?: string;

  @ApiProperty({ description: 'User agent string', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string | null;

  @ApiProperty({ description: 'Client IP address', required: false })
  @IsOptional()
  @IsString()
  ip?: string | null;

  @ApiProperty({ description: 'Session creation date' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Session expiration date' })
  @IsDateString()
  expiresAt: Date;

  @ApiProperty({ description: 'OAuth token expiration date', required: false })
  @IsOptional()
  @IsDateString()
  oauthTokenExpiresAt?: Date;

  @ApiProperty({ description: 'Whether session is active' })
  @IsBoolean()
  isActive: boolean;
}

export class ActiveSessionsResponseDto {
  @ApiProperty({ description: 'List of active sessions', type: [SessionDetailsDto] })
  sessions: SessionDetailsDto[];

  @ApiProperty({ description: 'Total number of sessions' })
  total: number;
}

export class OAuthSessionsResponseDto {
  @ApiProperty({ description: 'List of OAuth sessions', type: [SessionDetailsDto] })
  sessions: SessionDetailsDto[];

  @ApiProperty({ description: 'Total number of OAuth sessions' })
  total: number;
}
