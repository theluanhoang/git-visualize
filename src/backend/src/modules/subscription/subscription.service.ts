import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  Subscription,
  ESubscriptionStatus,
  ESubscriptionPlanType,
} from './subscription.entity';
import { User, EUserSubscriptionStatus } from '../users/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createSubscription(
    userId: string,
    createDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    try {
      // Check if user already has an active subscription
      const existingSubscription = await this.getActiveSubscription(userId);
      if (existingSubscription) {
        throw new BadRequestException(
          'User already has an active subscription',
        );
      }

      // Disable all old subscriptions for this user (set status to CANCELLED)
      const oldSubscriptions = await this.subscriptionRepository.find({
        where: {
          userId,
          status: ESubscriptionStatus.ACTIVE,
        },
      });

      // Cancel all old active subscriptions
      for (const oldSub of oldSubscriptions) {
        oldSub.status = ESubscriptionStatus.CANCELLED;
        oldSub.autoRenew = false;
        await this.subscriptionRepository.save(oldSub);
      }

      // Calculate end date based on plan type
      const startDate = new Date();
      const endDate = new Date();

      if (createDto.planType === ESubscriptionPlanType.MONTHLY) {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (createDto.planType === ESubscriptionPlanType.YEARLY) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscription = this.subscriptionRepository.create({
        userId,
        planType: createDto.planType,
        status: ESubscriptionStatus.PENDING, // Set to PENDING, will be activated after payment
        startDate,
        endDate,
        autoRenew: createDto.autoRenew ?? true,
      });

      const savedSubscription =
        await this.subscriptionRepository.save(subscription);

      // Don't update user status immediately - wait for payment confirmation
      // User status will be updated when payment is completed via webhook or manual verification

      return savedSubscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const now = new Date();
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        status: ESubscriptionStatus.ACTIVE,
        endDate: MoreThan(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async checkSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    subscription: Subscription | null;
  }> {
    const subscription = await this.getActiveSubscription(userId);
    return {
      hasActiveSubscription: !!subscription,
      subscription,
    };
  }

  async activateSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = ESubscriptionStatus.ACTIVE;
    const updated = await this.subscriptionRepository.save(subscription);

    // Update user subscription status
    await this.updateUserSubscriptionStatus(
      subscription.userId,
      EUserSubscriptionStatus.PRO,
      subscription.endDate,
    );

    return updated;
  }

  async cancelSubscription(
    subscriptionId: string,
    userId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = ESubscriptionStatus.CANCELLED;
    subscription.autoRenew = false;
    const updated = await this.subscriptionRepository.save(subscription);

    // Check if user still has any active subscription
    const activeSubscription = await this.getActiveSubscription(userId);

    // If no active subscription exists, update user status to FREE immediately
    if (!activeSubscription) {
      await this.updateUserSubscriptionStatus(
        userId,
        EUserSubscriptionStatus.FREE,
        null,
      );
    }

    return updated;
  }

  async renewSubscription(
    subscriptionId: string,
    userId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const currentEndDate = new Date(subscription.endDate);
    if (subscription.planType === ESubscriptionPlanType.MONTHLY) {
      currentEndDate.setMonth(currentEndDate.getMonth() + 1);
    } else {
      currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
    }

    subscription.endDate = currentEndDate;
    subscription.status = ESubscriptionStatus.ACTIVE;
    const updated = await this.subscriptionRepository.save(subscription);

    await this.updateUserSubscriptionStatus(
      userId,
      EUserSubscriptionStatus.PRO,
      updated.endDate,
    );

    return updated;
  }

  async extendSubscription(
    subscriptionId: string,
    days: number,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);

    subscription.endDate = newEndDate;
    if (subscription.status === ESubscriptionStatus.EXPIRED) {
      subscription.status = ESubscriptionStatus.ACTIVE;
    }

    const updated = await this.subscriptionRepository.save(subscription);
    await this.updateUserSubscriptionStatus(
      subscription.userId,
      EUserSubscriptionStatus.PRO,
      updated.endDate,
    );

    return updated;
  }

  async expireSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['user'],
    });

    if (!subscription) {
      return;
    }

    subscription.status = ESubscriptionStatus.EXPIRED;
    await this.subscriptionRepository.save(subscription);

    await this.updateUserSubscriptionStatus(
      subscription.userId,
      EUserSubscriptionStatus.EXPIRED,
      null,
    );
  }

  async expireOldSubscriptions(): Promise<void> {
    const now = new Date();
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: ESubscriptionStatus.ACTIVE,
      },
    });

    for (const subscription of expiredSubscriptions) {
      if (new Date(subscription.endDate) < now) {
        await this.expireSubscription(subscription.id);
      }
    }
  }

  private async updateUserSubscriptionStatus(
    userId: string,
    status: EUserSubscriptionStatus,
    expiresAt: Date | null,
  ): Promise<void> {
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const updateData: any = {
        subscriptionStatus: status,
      };
      if (expiresAt !== null) {
        updateData.subscriptionExpiresAt = expiresAt;
      } else {
        updateData.subscriptionExpiresAt = null;
      }

      const result = await this.userRepository.update(userId, updateData);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Failed to update user subscription status for user ${userId}`,
        );
      }
    } catch (error) {
      console.error('Error in updateUserSubscriptionStatus:', error);
      throw error;
    }
  }

  // Admin methods
  async getAllSubscriptions(
    skip?: number,
    take?: number,
  ): Promise<[Subscription[], number]> {
    return this.subscriptionRepository.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async getSubscriptionById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async deactivateSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(subscriptionId);
    subscription.status = ESubscriptionStatus.CANCELLED;
    subscription.autoRenew = false;
    const updated = await this.subscriptionRepository.save(subscription);

    // Check if user still has any active subscription
    const activeSubscription = await this.getActiveSubscription(
      subscription.userId,
    );

    // If no active subscription exists, update user status to FREE immediately
    if (!activeSubscription) {
      await this.updateUserSubscriptionStatus(
        subscription.userId,
        EUserSubscriptionStatus.FREE,
        null,
      );
    }

    return updated;
  }
}
