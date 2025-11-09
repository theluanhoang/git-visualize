import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { EUserRole } from '../user.interface';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User email' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'User first name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'User role', enum: EUserRole })
  @IsEnum(EUserRole)
  role: EUserRole;

  @ApiProperty({ description: 'Whether user is active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'User creation date' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  @IsDateString()
  updatedAt: Date;
}

export class UserStatsDto {
  @ApiProperty({ description: 'Total number of sessions' })
  totalSessions: number;

  @ApiProperty({ description: 'Number of active sessions' })
  activeSessions: number;

  @ApiProperty({ description: 'Number of OAuth sessions' })
  oauthSessions: number;

  @ApiProperty({ description: 'Last login date', required: false })
  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date | null;
}
