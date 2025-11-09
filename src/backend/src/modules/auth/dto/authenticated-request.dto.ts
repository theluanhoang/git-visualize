import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EUserRole } from '../../users/user.interface';

export class AuthenticatedUserDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  sub: string;

  @ApiProperty({ description: 'User email' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'User role', enum: EUserRole })
  @IsEnum(EUserRole)
  role: EUserRole;

  @ApiProperty({ description: 'Token issued at timestamp', required: false })
  @IsOptional()
  iat?: number;

  @ApiProperty({ description: 'Token expiration timestamp', required: false })
  @IsOptional()
  exp?: number;
}

export class AuthenticatedRequestDto {
  @ApiProperty({ description: 'Authenticated user information', type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;

  @ApiProperty({ description: 'Get header value', required: false })
  @IsOptional()
  get(header: string): string | undefined {
    return undefined;
  }

  @ApiProperty({ description: 'Client IP address', required: false })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({ description: 'Connection information', required: false })
  @IsOptional()
  connection?: {
    remoteAddress?: string;
  };
}
