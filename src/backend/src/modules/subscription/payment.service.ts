import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, EPaymentMethod, EPaymentStatus } from './payment.entity';
import { Subscription, ESubscriptionStatus } from './subscription.entity';
import { User } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
import { CassoService, CassoWebhookData } from './casso.service';
import { SubscriptionService } from './subscription.service';
import { PaymentGateway } from './payment.gateway';
import { PaymentNotificationService } from './payment-notification.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private cassoService: CassoService,
    private subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => PaymentGateway))
    private paymentGateway: PaymentGateway,
    private paymentNotificationService: PaymentNotificationService,
  ) {}

  /**
   * Tạo payment request cho subscription upgrade
   */
  async createPayment(
    userId: string,
    subscriptionId: string,
    planType: 'MONTHLY' | 'YEARLY',
  ): Promise<Payment> {
    // Kiểm tra user tồn tại
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra subscription tồn tại và thuộc về user
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Tính toán số tiền (hardcoded prices)
    const monthlyPrice = 99000; // 99,000 VND/tháng
    const yearlyPrice = 990000; // 990,000 VND/năm
    const amount = planType === 'MONTHLY' ? monthlyPrice : yearlyPrice;
    const currency =
      this.configService.get<string>('subscription.currency') || 'VND';

    // Tạo payment record
    const payment = this.paymentRepository.create({
      userId,
      subscriptionId,
      paymentMethod: EPaymentMethod.CASSO,
      status: EPaymentStatus.PENDING,
      amount,
      currency,
      description: `Thanh toán nâng cấp ${planType === 'MONTHLY' ? 'tháng' : 'năm'} - ${user.email}`,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Luôn tạo QR code ngay cả khi Casso API fail
    const bankAccount =
      this.configService.get<string>('casso.bankAccount') || '';
    const bankName = this.configService.get<string>('casso.bankName') || '';

    try {
      // Tạo transaction trên Casso
      const cassoTransaction = await this.cassoService.createTransaction({
        amount,
        description:
          payment.description || `Payment for subscription ${subscriptionId}`,
        cusName: user.email,
        cusEmail: user.email,
      });

      savedPayment.transactionId = cassoTransaction.id;
      savedPayment.cassoTransactionId = cassoTransaction.tid;
    } catch (error) {
      this.logger.warn(
        `Casso transaction creation failed, but continuing with QR code: ${error.message}`,
      );
      // Tiếp tục tạo QR code ngay cả khi Casso API fail
    }

    // Luôn tạo VietQR nếu có bankAccount và bankName
    if (bankAccount && bankName) {
      try {
        const qrCode = await this.cassoService.createVietQR(
          amount,
          payment.description || '',
          savedPayment.id,
        );

        savedPayment.paymentUrl = qrCode;
        savedPayment.qrCode = qrCode;
        savedPayment.bankAccount = bankAccount;
        savedPayment.bankName = bankName;

        this.logger.log(`Created QR code for payment ${savedPayment.id}`);
      } catch (error) {
        this.logger.error(
          `Error creating VietQR: ${error.message}`,
          error.stack,
        );
        // Vẫn lưu bank info ngay cả khi QR code fail
        savedPayment.bankAccount = bankAccount;
        savedPayment.bankName = bankName;
      }
    } else {
      this.logger.warn(
        'Bank account or bank name not configured. QR code will not be generated.',
      );
    }

    return await this.paymentRepository.save(savedPayment);
  }

  /**
   * Xử lý webhook từ Casso
   */
  async handleCassoWebhook(
    webhookData: CassoWebhookData,
    signature?: string,
  ): Promise<Payment> {
    // Verify webhook signature
    const payload = JSON.stringify(webhookData);
    if (
      signature &&
      !this.cassoService.verifyWebhookSignature(signature, payload)
    ) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Tìm payment theo transactionId hoặc cassoTransactionId
    let payment = await this.paymentRepository.findOne({
      where: [
        { transactionId: webhookData.id },
        { cassoTransactionId: webhookData.tid },
      ],
    });

    if (!payment) {
      // Không tìm thấy payment tương ứng với transaction từ Casso.
      // Với flow nâng cấp Pro trong app, payment luôn được tạo TRƯỚC khi user thanh toán.
      // Vì vậy nếu webhook không map được, coi như lỗi cấu hình/flow, KHÔNG tạo payment mới
      // để tránh lệch paymentId giữa FE và BE (khiến WebSocket emit không tới được FE).
      this.logger.error(
        `[handleCassoWebhook] Payment not found for transaction. Not creating new payment to avoid mismatched paymentId.`,
        {
          webhookId: webhookData.id,
          webhookTid: webhookData.tid,
          reference: webhookData.reference,
          description: webhookData.description,
        },
      );
      throw new NotFoundException(
        'Payment not found for this transaction. Please create payment in the app before paying.',
      );
    }

    // Cập nhật payment với thông tin từ webhook
    // Casso webhook có thể có nested structure: { data: { amount: ... } } hoặc { amount: ... }
    const webhookAmount =
      (webhookData as any).data?.amount ?? webhookData.amount;
    const webhookDescription =
      (webhookData as any).data?.description ?? webhookData.description;
    const webhookId = (webhookData as any).data?.id ?? webhookData.id;
    const webhookTid = (webhookData as any).data?.tid ?? webhookData.tid;

    payment.amount = webhookAmount || payment.amount;
    payment.description = webhookDescription || payment.description;
    payment.transactionId = webhookId || payment.transactionId;
    payment.cassoTransactionId = webhookTid || payment.cassoTransactionId;
    payment.cassoWebhookData = webhookData;

    // Parse paymentDate từ webhookData.when với validation
    if (webhookData.when) {
      try {
        const paymentDate = new Date(webhookData.when);
        // Kiểm tra date có hợp lệ không
        if (!isNaN(paymentDate.getTime())) {
          payment.paymentDate = paymentDate;
        } else {
          this.logger.warn(
            `Invalid payment date from webhook: ${webhookData.when}, using current date`,
          );
          payment.paymentDate = new Date();
        }
      } catch (error) {
        this.logger.warn(
          `Error parsing payment date: ${webhookData.when}, using current date`,
        );
        payment.paymentDate = new Date();
      }
    } else {
      // Nếu không có when, dùng thời gian hiện tại
      payment.paymentDate = new Date();
    }

    payment.bankAccount = webhookData.corresponsiveAccount;
    payment.bankName = webhookData.corresponsiveBankName;

    // Kiểm tra số tiền khớp và cập nhật status
    // Sử dụng webhookAmount đã được parse ở trên
    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(webhookAmount);

    this.logger.log(`Checking payment amount for payment ${payment.id}:`, {
      expectedAmount,
      receivedAmount,
      webhookAmountRaw: webhookAmount,
      expectedType: typeof payment.amount,
      receivedType: typeof webhookAmount,
      webhookDataStructure: {
        hasAmount: 'amount' in webhookData,
        hasData: 'data' in webhookData,
        dataAmount: (webhookData as any).data?.amount,
      },
      comparison: receivedAmount >= expectedAmount,
    });

    // Cho phép sai số nhỏ (1 VND) để tránh lỗi do làm tròn
    const tolerance = 1;
    const amountDifference = Math.abs(receivedAmount - expectedAmount);

    if (receivedAmount >= expectedAmount - tolerance) {
      payment.status = EPaymentStatus.COMPLETED;
      if (amountDifference > 0) {
        this.logger.log(
          `Payment ${payment.id} marked as COMPLETED with amount difference: ${amountDifference} VND`,
        );
      } else {
        this.logger.log(
          `Payment ${payment.id} marked as COMPLETED. Amount matches exactly.`,
        );
      }

      // Nếu có subscriptionId, kích hoạt subscription
      if (payment.subscriptionId) {
        try {
          const subscription = await this.subscriptionRepository.findOne({
            where: { id: payment.subscriptionId },
          });

          if (
            subscription &&
            subscription.status === ESubscriptionStatus.PENDING
          ) {
            await this.subscriptionService.activateSubscription(
              subscription.id,
            );
            this.logger.log(
              `Activated subscription ${subscription.id} after payment ${payment.id}`,
            );
          } else {
            this.logger.warn(
              `Subscription ${payment.subscriptionId} not found or not pending. Status: ${subscription?.status}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error activating subscription: ${error.message}`,
            error.stack,
          );
        }
      } else {
        this.logger.warn(`Payment ${payment.id} has no subscriptionId`);
      }
    } else {
      payment.status = EPaymentStatus.FAILED;
      payment.notes = `Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}, difference: ${amountDifference}`;
      this.logger.warn(
        `Payment ${payment.id} failed due to amount mismatch. Expected: ${expectedAmount}, Received: ${receivedAmount}, Difference: ${amountDifference}`,
      );
    }

    const savedPayment = await this.paymentRepository.save(payment);
    this.logger.log(
      `Payment ${savedPayment.id} saved with status: ${savedPayment.status}`,
    );

    // Notify user about payment completion via WebSocket
    this.logger.log(
      `[PaymentService] Checking if payment is COMPLETED to send notification`,
      {
        paymentId: savedPayment.id,
        paymentStatus: savedPayment.status,
        userId: savedPayment.userId,
        timestamp: new Date().toISOString(),
      },
    );

    if (savedPayment.status === EPaymentStatus.COMPLETED) {
      this.logger.log(
        `[PaymentService] Payment ${savedPayment.id} is COMPLETED. Notifying user ${savedPayment.userId}`,
        {
          paymentId: savedPayment.id,
          userId: savedPayment.userId,
          status: savedPayment.status,
          timestamp: new Date().toISOString(),
        },
      );

      try {
        // PaymentNotificationService sẽ emit qua WebSocket
        this.logger.log(
          `[PaymentService] Calling paymentNotificationService.notifyPaymentCompleted...`,
          {
            paymentId: savedPayment.id,
            userId: savedPayment.userId,
          },
        );

        await this.paymentNotificationService.notifyPaymentCompleted(
          savedPayment,
        );

        this.logger.log(
          `✅ [PaymentService] Successfully notified user ${savedPayment.userId} about payment ${savedPayment.id}`,
          {
            paymentId: savedPayment.id,
            userId: savedPayment.userId,
            timestamp: new Date().toISOString(),
          },
        );
      } catch (error) {
        // Log but don't fail webhook processing
        this.logger.error(
          `❌ [PaymentService] Failed to notify user about payment completion: ${error.message}`,
          {
            paymentId: savedPayment.id,
            userId: savedPayment.userId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          },
        );
      }
    } else {
      this.logger.log(
        `[PaymentService] Payment ${savedPayment.id} status is ${savedPayment.status}, not sending notification`,
        {
          paymentId: savedPayment.id,
          status: savedPayment.status,
          expectedStatus: EPaymentStatus.COMPLETED,
          timestamp: new Date().toISOString(),
        },
      );
    }

    return savedPayment;
  }

  /**
   * Lấy payment theo ID
   */
  async getPaymentById(paymentId: string, userId?: string): Promise<Payment> {
    const where: any = { id: paymentId };
    if (userId) {
      where.userId = userId;
    }

    const payment = await this.paymentRepository.findOne({
      where,
      relations: ['user', 'subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Lấy tất cả payments của user
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['subscription'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Xác minh payment (manual verification)
   */
  async verifyPayment(
    paymentId: string,
    transactionId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === EPaymentStatus.COMPLETED) {
      return payment;
    }

    // Kiểm tra với Casso API
    const isPaid = await this.cassoService.checkPaymentStatus(transactionId);

    if (isPaid) {
      payment.status = EPaymentStatus.COMPLETED;
      payment.transactionId = transactionId;
      payment.paymentDate = new Date();

      // Kích hoạt subscription nếu có
      if (payment.subscriptionId) {
        const subscription = await this.subscriptionRepository.findOne({
          where: { id: payment.subscriptionId },
        });

        if (
          subscription &&
          subscription.status === ESubscriptionStatus.PENDING
        ) {
          await this.subscriptionService.activateSubscription(subscription.id);
        }
      }
    } else {
      throw new BadRequestException('Payment not verified');
    }

    return await this.paymentRepository.save(payment);
  }

  /**
   * Admin: Lấy tất cả payments
   */
  async getAllPayments(
    skip?: number,
    take?: number,
  ): Promise<[Payment[], number]> {
    return this.paymentRepository.findAndCount({
      relations: ['user', 'subscription'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * Admin: Refund payment
   */
  async refundPayment(paymentId: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== EPaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    payment.status = EPaymentStatus.REFUNDED;
    payment.notes = reason || 'Refunded by admin';

    // Hủy subscription nếu có
    if (payment.subscriptionId) {
      try {
        await this.subscriptionService.cancelSubscription(
          payment.subscriptionId,
          payment.userId,
        );
      } catch (error) {
        this.logger.error(
          `Error canceling subscription during refund: ${error.message}`,
        );
      }
    }

    return await this.paymentRepository.save(payment);
  }
}
