import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @MinLength(1)
  subject: string;

  @ApiProperty({ description: 'Email message body' })
  @IsString()
  @MinLength(1)
  message: string;
}


