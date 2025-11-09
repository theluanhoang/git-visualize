import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ example: 'user-id-uuid' })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Refresh token string' })
  @IsString()
  refreshToken: string;
}


