import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Transaction ID from payment gateway',
    example: 'TXN123456789',
  })
  @IsString()
  transactionId: string;
}

