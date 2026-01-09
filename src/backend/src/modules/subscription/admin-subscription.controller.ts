import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ForAdmin } from '../auth/decorators/roles.decorator';
import { SubscriptionService } from './subscription.service';
import { AdminSubscriptionQueryDto } from './dto/admin-subscription-query.dto';
import { ProUsersQueryDto } from './dto/pro-users-query.dto';
import { ExtendSubscriptionDto } from './dto/extend-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import {
  ESubscriptionStatus,
  ESubscriptionPlanType,
} from './subscription.entity';

@ApiTags('Admin - Subscriptions')
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ForAdmin()
  @ApiOperation({
    summary: 'Get all subscriptions with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
  })
  async getAllSubscriptions(@Query() query: AdminSubscriptionQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const take = query.limit || 20;

    const [subscriptions, total] =
      await this.subscriptionService.getAllSubscriptions(skip, take);

    return {
      data: subscriptions.map((s) => this.mapToResponse(s)),
      total,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get('stats')
  @ForAdmin()
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getSubscriptionStats() {
    const [allSubscriptions] =
      await this.subscriptionService.getAllSubscriptions(0, 10000);

    const stats = {
      total: allSubscriptions.length,
      active: allSubscriptions.filter(
        (s) => s.status === ESubscriptionStatus.ACTIVE,
      ).length,
      cancelled: allSubscriptions.filter(
        (s) => s.status === ESubscriptionStatus.CANCELLED,
      ).length,
      expired: allSubscriptions.filter(
        (s) => s.status === ESubscriptionStatus.EXPIRED,
      ).length,
      pending: allSubscriptions.filter(
        (s) => s.status === ESubscriptionStatus.PENDING,
      ).length,
      monthly: allSubscriptions.filter(
        (s) => s.planType === ESubscriptionPlanType.MONTHLY,
      ).length,
      yearly: allSubscriptions.filter(
        (s) => s.planType === ESubscriptionPlanType.YEARLY,
      ).length,
    };

    return stats;
  }

  @Get('pro-users')
  @ForAdmin()
  @ApiOperation({ summary: 'Get all Pro users' })
  @ApiResponse({ status: 200, description: 'Pro users retrieved successfully' })
  async getProUsers(@Query() query: ProUsersQueryDto) {
    // This would need to be implemented in UserService
    // For now, return subscriptions with user info
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const take = query.limit || 20;

    const [subscriptions] = await this.subscriptionService.getAllSubscriptions(
      skip,
      take,
    );
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === ESubscriptionStatus.ACTIVE,
    );

    return {
      data: activeSubscriptions.map((s) => ({
        user: s.user,
        subscription: this.mapToResponse(s),
      })),
      total: activeSubscriptions.length,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get(':id')
  @ForAdmin()
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    type: SubscriptionResponseDto,
  })
  async getSubscriptionById(
    @Param('id') id: string,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    return this.mapToResponse(subscription);
  }

  @Post(':id/activate')
  @ForAdmin()
  @ApiOperation({ summary: 'Activate subscription manually' })
  @ApiResponse({
    status: 200,
    description: 'Subscription activated',
    type: SubscriptionResponseDto,
  })
  async activateSubscription(
    @Param('id') id: string,
  ): Promise<SubscriptionResponseDto> {
    const subscription =
      await this.subscriptionService.activateSubscription(id);
    return this.mapToResponse(subscription);
  }

  @Post(':id/deactivate')
  @ForAdmin()
  @ApiOperation({ summary: 'Deactivate subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription deactivated',
    type: SubscriptionResponseDto,
  })
  async deactivateSubscription(
    @Param('id') id: string,
  ): Promise<SubscriptionResponseDto> {
    const subscription =
      await this.subscriptionService.deactivateSubscription(id);
    return this.mapToResponse(subscription);
  }

  @Post(':id/extend')
  @ForAdmin()
  @ApiOperation({ summary: 'Extend subscription manually' })
  @ApiResponse({
    status: 200,
    description: 'Subscription extended',
    type: SubscriptionResponseDto,
  })
  async extendSubscription(
    @Param('id') id: string,
    @Body() dto: ExtendSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.extendSubscription(
      id,
      dto.days,
    );
    return this.mapToResponse(subscription);
  }

  @Post(':id/cancel')
  @ForAdmin()
  @ApiOperation({ summary: 'Cancel subscription (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled',
    type: SubscriptionResponseDto,
  })
  async cancelSubscription(
    @Param('id') id: string,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.getSubscriptionById(id);
    const cancelled = await this.subscriptionService.cancelSubscription(
      id,
      subscription.userId,
    );
    return this.mapToResponse(cancelled);
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
