import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ESubscriptionPlanType } from '../subscription.entity';

export class CreateSubscriptionDto {
    @ApiProperty({
        description: 'Subscription plan type',
        enum: ESubscriptionPlanType,
        example: ESubscriptionPlanType.MONTHLY,
    })
    @IsEnum(ESubscriptionPlanType)
    planType: ESubscriptionPlanType;

    @ApiProperty({
        description: 'Auto renew subscription',
        default: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    autoRenew?: boolean;
}










