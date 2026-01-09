import { ApiProperty } from '@nestjs/swagger';
import { EPaymentMethod, EPaymentStatus } from '../payment.entity';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ nullable: true })
  subscriptionId: string | null;

  @ApiProperty({ enum: EPaymentMethod })
  paymentMethod: EPaymentMethod;

  @ApiProperty({ enum: EPaymentStatus })
  status: EPaymentStatus;

  @ApiProperty()
  amount: number;

  @ApiProperty({ nullable: true })
  currency: string | null;

  @ApiProperty({ nullable: true })
  transactionId: string | null;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true })
  paymentDate: Date | null;

  @ApiProperty({ nullable: true })
  paymentUrl: string | null;

  @ApiProperty({ nullable: true })
  qrCode: string | null;

  @ApiProperty({ nullable: true })
  bankAccount: string | null;

  @ApiProperty({ nullable: true })
  bankName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

