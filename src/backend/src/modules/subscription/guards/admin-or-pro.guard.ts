import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../subscription.service';
import { ESubscriptionStatus } from '../subscription.entity';
import { EUserRole } from '../../users/user.interface';

@Injectable()
export class AdminOrProGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private subscriptionService: SubscriptionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.sub) {
            throw new ForbiddenException('Authentication required');
        }

        // Admin can always access
        if (user.role === EUserRole.ADMIN) {
            return true;
        }

        // Check Pro subscription
        const subscription = await this.subscriptionService.getActiveSubscription(user.sub);

        if (!subscription || subscription.status !== ESubscriptionStatus.ACTIVE) {
            throw new ForbiddenException('Admin role or Pro subscription required');
        }

        return true;
    }
}













