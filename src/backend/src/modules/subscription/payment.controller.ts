import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/current-user.decorator';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PaymentGateway } from './payment.gateway';

@ApiTags('Payments')
@Controller('subscription/payment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create payment for subscription upgrade' })
  @ApiResponse({
    status: 201,
    description: 'Payment created',
    type: PaymentResponseDto,
  })
  async createPayment(
    @UserId() userId: string,
    @Body() createDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    // Lấy subscription để biết planType
    const subscription = await this.subscriptionService.getSubscriptionById(
      createDto.subscriptionId,
    );

    if (subscription.userId !== userId) {
      throw new BadRequestException('Subscription does not belong to user');
    }

    const payment = await this.paymentService.createPayment(
      userId,
      createDto.subscriptionId,
      subscription.planType,
    );

    return this.mapToResponse(payment);
  }

  @Post('create-subscription')
  @ApiOperation({ summary: 'Create subscription and payment in one step' })
  @ApiResponse({
    status: 201,
    description: 'Subscription and payment created',
    type: PaymentResponseDto,
  })
  async createSubscriptionWithPayment(
    @UserId() userId: string,
    @Body() createDto: CreateSubscriptionDto,
  ): Promise<PaymentResponseDto> {
    // Tạo subscription với status PENDING
    const subscription = await this.subscriptionService.createSubscription(
      userId,
      {
        ...createDto,
        // Override để tạo subscription với status PENDING
      },
    );

    // Tạo payment
    const payment = await this.paymentService.createPayment(
      userId,
      subscription.id,
      createDto.planType,
    );

    return this.mapToResponse(payment);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user payments' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved',
    type: [PaymentResponseDto],
  })
  async getMyPayments(@UserId() userId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentService.getUserPayments(userId);
    return payments.map((p) => this.mapToResponse(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved',
    type: PaymentResponseDto,
  })
  async getPayment(
    @UserId() userId: string,
    @Param('id') paymentId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.getPaymentById(paymentId, userId);
    return this.mapToResponse(payment);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify payment manually' })
  @ApiResponse({
    status: 200,
    description: 'Payment verified',
    type: PaymentResponseDto,
  })
  async verifyPayment(
    @UserId() userId: string,
    @Param('id') paymentId: string,
    @Body() verifyDto: VerifyPaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.verifyPayment(
      paymentId,
      verifyDto.transactionId,
    );
    return this.mapToResponse(payment);
  }

  @Post('test-socket/:paymentId')
  @ApiOperation({ summary: 'Test socket event emission (for debugging)' })
  @ApiResponse({
    status: 200,
    description: 'Test event emitted',
  })
  async testSocketEvent(
    @UserId() userId: string,
    @Param('paymentId') paymentId: string,
  ) {
    const payment = await this.paymentService.getPaymentById(paymentId, userId);
    
    // Emit test event
    const emitSuccess = await this.paymentGateway.emitPaymentCompleted(userId, payment);
    
    return {
      success: true,
      paymentId,
      userId,
      emitSuccess,
      message: emitSuccess 
        ? 'Event emitted successfully' 
        : 'Event emitted but no sockets found in room',
    };
  }


  private mapToResponse(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      userId: payment.userId,
      subscriptionId: payment.subscriptionId,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      transactionId: payment.transactionId,
      description: payment.description,
      paymentDate: payment.paymentDate,
      paymentUrl: payment.paymentUrl,
      qrCode: payment.qrCode,
      bankAccount: payment.bankAccount,
      bankName: payment.bankName,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
