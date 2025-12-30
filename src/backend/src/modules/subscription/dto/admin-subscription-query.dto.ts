import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ESubscriptionStatus, ESubscriptionPlanType } from '../subscription.entity';

export class AdminSubscriptionQueryDto {
    @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;

    @ApiPropertyOptional({ description: 'Filter by status', enum: ESubscriptionStatus })
    @IsEnum(ESubscriptionStatus)
    @IsOptional()
    status?: ESubscriptionStatus;

    @ApiPropertyOptional({ description: 'Filter by plan type', enum: ESubscriptionPlanType })
    @IsEnum(ESubscriptionPlanType)
    @IsOptional()
    planType?: ESubscriptionPlanType;

    @ApiPropertyOptional({ description: 'Search by user email' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
    @IsString()
    @IsOptional()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
    @IsString()
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}










