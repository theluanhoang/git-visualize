import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    UseGuards,
    Param,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/current-user.decorator';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { RequirePro } from './decorators/require-pro.decorator';
import { ProSubscriptionGuard } from './guards/pro-subscription.guard';

@ApiTags('Subscriptions')
@Controller('subscription')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new subscription' })
    @ApiResponse({ status: 201, description: 'Subscription created', type: SubscriptionResponseDto })
    async createSubscription(
        @UserId() userId: string,
        @Body() createDto: CreateSubscriptionDto,
    ): Promise<SubscriptionResponseDto> {
        const subscription = await this.subscriptionService.createSubscription(userId, createDto);
        return this.mapToResponse(subscription);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get current user subscription' })
    @ApiResponse({ status: 200, description: 'Subscription retrieved', type: SubscriptionResponseDto })
    async getMySubscription(@UserId() userId: string): Promise<SubscriptionResponseDto | null> {
        const subscription = await this.subscriptionService.getUserSubscription(userId);
        return subscription ? this.mapToResponse(subscription) : null;
    }

    @Get('status')
    @ApiOperation({ summary: 'Check subscription status' })
    @ApiResponse({ status: 200, description: 'Subscription status checked' })
    async checkStatus(@UserId() userId: string) {
        return this.subscriptionService.checkSubscriptionStatus(userId);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancel subscription' })
    @ApiResponse({ status: 200, description: 'Subscription cancelled', type: SubscriptionResponseDto })
    async cancelSubscription(
        @UserId() userId: string,
        @Param('id') subscriptionId: string,
    ): Promise<SubscriptionResponseDto> {
        const subscription = await this.subscriptionService.cancelSubscription(subscriptionId, userId);
        return this.mapToResponse(subscription);
    }

    @Post(':id/renew')
    @ApiOperation({ summary: 'Renew subscription' })
    @ApiResponse({ status: 200, description: 'Subscription renewed', type: SubscriptionResponseDto })
    async renewSubscription(
        @UserId() userId: string,
        @Param('id') subscriptionId: string,
    ): Promise<SubscriptionResponseDto> {
        const subscription = await this.subscriptionService.renewSubscription(subscriptionId, userId);
        return this.mapToResponse(subscription);
    }

    private mapToResponse(subscription: any): SubscriptionResponseDto {
        return {
            id: subscription.id,
            userId: subscription.userId,
            planType: subscription.planType,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            autoRenew: subscription.autoRenew,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
            user: subscription.user
                ? {
                      id: subscription.user.id,
                      email: subscription.user.email,
                  }
                : undefined,
        };
    }
}

