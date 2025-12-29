import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../subscription.service';
import { ESubscriptionStatus } from '../subscription.entity';

export const REQUIRE_PRO_KEY = 'requirePro';

@Injectable()
export class ProSubscriptionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private subscriptionService: SubscriptionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requirePro = this.reflector.getAllAndOverride<boolean>(REQUIRE_PRO_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requirePro) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.sub) {
            throw new ForbiddenException('Authentication required');
        }

        const subscription = await this.subscriptionService.getActiveSubscription(user.sub);

        if (!subscription || subscription.status !== ESubscriptionStatus.ACTIVE) {
            throw new ForbiddenException('Pro subscription required');
        }

        return true;
    }
}

