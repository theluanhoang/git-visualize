import { ApiProperty } from '@nestjs/swagger';
import {
  ESubscriptionPlanType,
  ESubscriptionStatus,
} from '../subscription.entity';

export class SubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ESubscriptionPlanType })
  planType: ESubscriptionPlanType;

  @ApiProperty({ enum: ESubscriptionStatus })
  status: ESubscriptionStatus;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  autoRenew: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    email: string;
  };
}
