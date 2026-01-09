import { Injectable, Logger } from '@nestjs/common';
import { Payment, EPaymentStatus } from './payment.entity';
import { PaymentGateway } from './payment.gateway';

@Injectable()
export class PaymentNotificationService {
  private readonly logger = new Logger(PaymentNotificationService.name);

  constructor(
    private paymentGateway: PaymentGateway,
  ) {}

  /**
   * Gửi notification khi payment completed qua WebSocket
   * Chỉ sử dụng WebSocket, không có polling fallback
   */
  async notifyPaymentCompleted(payment: Payment): Promise<void> {
    this.logger.log(
      `[PaymentNotificationService] notifyPaymentCompleted called`,
      {
        paymentId: payment.id,
        paymentStatus: payment.status,
        userId: payment.userId,
        subscriptionId: payment.subscriptionId,
        amount: payment.amount,
        timestamp: new Date().toISOString(),
      },
    );

    if (payment.status !== EPaymentStatus.COMPLETED) {
      this.logger.log(
        `[PaymentNotificationService] Payment status is not COMPLETED, skipping notification`,
        {
          paymentId: payment.id,
          status: payment.status,
          expectedStatus: EPaymentStatus.COMPLETED,
        },
      );
      return;
    }

    this.logger.log(
      `[PaymentNotificationService] Notifying user ${payment.userId} about payment ${payment.id} completion via WebSocket`,
      {
        paymentId: payment.id,
        userId: payment.userId,
        timestamp: new Date().toISOString(),
      },
    );

    // Emit qua WebSocket
    try {
      this.logger.log(
        `[PaymentNotificationService] Calling paymentGateway.emitPaymentCompleted...`,
        {
          paymentId: payment.id,
          userId: payment.userId,
        },
      );

      const emitSuccess = await this.paymentGateway.emitPaymentCompleted(
        payment.userId,
        payment,
      );

      this.logger.log(
        `[PaymentNotificationService] emitPaymentCompleted returned: ${emitSuccess}`,
        {
          paymentId: payment.id,
          userId: payment.userId,
          emitSuccess,
        },
      );

      if (emitSuccess) {
        this.logger.log(
          `✅ [PaymentNotificationService] Payment completion notification sent via WebSocket to user ${payment.userId} for payment ${payment.id}`,
          {
            paymentId: payment.id,
            userId: payment.userId,
            timestamp: new Date().toISOString(),
          },
        );
      } else {
        this.logger.warn(
          `⚠️ [PaymentNotificationService] User ${payment.userId} not connected to WebSocket. Payment ${payment.id} completion notification was not delivered.`,
          {
            paymentId: payment.id,
            userId: payment.userId,
            timestamp: new Date().toISOString(),
          },
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ [PaymentNotificationService] Failed to emit WebSocket notification for payment ${payment.id}: ${error.message}`,
        {
          paymentId: payment.id,
          userId: payment.userId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        },
      );
    }
  }



}
