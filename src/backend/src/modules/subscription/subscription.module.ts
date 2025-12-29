import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Subscription } from './subscription.entity';
import { User } from '../users/user.entity';
import { SubscriptionController } from './subscription.controller';
import { AdminSubscriptionController } from './admin-subscription.controller';
import { SubscriptionService } from './subscription.service';
import { ProSubscriptionGuard } from './guards/pro-subscription.guard';
import { AdminOrProGuard } from './guards/admin-or-pro.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([Subscription, User]),
        ConfigModule,
    ],
    controllers: [
        SubscriptionController,
        AdminSubscriptionController,
    ],
    providers: [
        SubscriptionService,
        ProSubscriptionGuard,
        AdminOrProGuard,
    ],
    exports: [
        SubscriptionService,
        ProSubscriptionGuard,
        AdminOrProGuard,
    ],
})
export class SubscriptionModule {}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            