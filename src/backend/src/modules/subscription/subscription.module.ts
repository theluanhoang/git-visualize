import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Subscription } from './subscription.entity';
import { Payment } from './payment.entity';
import { PaymentNotification } from './payment-notification.entity';
import { User } from '../users/user.entity';
import { SubscriptionController } from './subscription.controller';
import { PaymentController } from './payment.controller';
import { WebhookController } from './webhook.controller';
import { AdminSubscriptionController } from './admin-subscription.controller';
import { AdminPaymentController } from './admin-payment.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';
import { PaymentNotificationService } from './payment-notification.service';
import { CassoService } from './casso.service';
import { PaymentGateway } from './payment.gateway';
import { ProSubscriptionGuard } from './guards/pro-subscription.guard';
import { AdminOrProGuard } from './guards/admin-or-pro.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      Payment,
      PaymentNotification,
      User,
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtAccessSecret') || 'default-secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    SubscriptionController,
    PaymentController,
    WebhookController,
    AdminSubscriptionController,
    AdminPaymentController,
  ],
  providers: [
    SubscriptionService,
    PaymentService,
    PaymentNotificationService,
    CassoService,
    PaymentGateway,
    ProSubscriptionGuard,
    AdminOrProGuard,
  ],
  exports: [
    SubscriptionService,
    PaymentService,
    PaymentNotificationService,
    ProSubscriptionGuard,
    AdminOrProGuard,
  ],
})
export class SubscriptionModule {}
