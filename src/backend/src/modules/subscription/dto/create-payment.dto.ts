import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Subscription ID to create payment for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  subscriptionId: string;
}

