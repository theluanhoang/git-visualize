import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ForAdmin } from '../auth/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { EPaymentStatus, EPaymentMethod } from './payment.entity';

@ApiTags('Admin - Payments')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ForAdmin()
  @ApiOperation({ summary: 'Get all payments with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getAllPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: EPaymentStatus,
    @Query('paymentMethod') paymentMethod?: EPaymentMethod,
  ) {
    const skip = ((page || 1) - 1) * (limit || 20);
    const take = limit || 20;

    const [payments, total] = await this.paymentService.getAllPayments(
      skip,
      take,
    );

    // Filter by status and paymentMethod if provided
    let filteredPayments = payments;
    if (status) {
      filteredPayments = filteredPayments.filter((p) => p.status === status);
    }
    if (paymentMethod) {
      filteredPayments = filteredPayments.filter(
        (p) => p.paymentMethod === paymentMethod,
      );
    }

    return {
      data: filteredPayments.map((p) => this.mapToResponse(p)),
      total: filteredPayments.length,
      page: page || 1,
      limit: limit || 20,
    };
  }

  @Get('stats')
  @ForAdmin()
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getPaymentStats() {
    const [allPayments] = await this.paymentService.getAllPayments(0, 10000);

    const totalRevenue = allPayments
      .filter((p) => p.status === EPaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const stats = {
      total: allPayments.length,
      completed: allPayments.filter(
        (p) => p.status === EPaymentStatus.COMPLETED,
      ).length,
      pending: allPayments.filter((p) => p.status === EPaymentStatus.PENDING)
        .length,
      failed: allPayments.filter((p) => p.status === EPaymentStatus.FAILED)
        .length,
      refunded: allPayments.filter((p) => p.status === EPaymentStatus.REFUNDED)
        .length,
      casso: allPayments.filter((p) => p.paymentMethod === EPaymentMethod.CASSO)
        .length,
      manual: allPayments.filter(
        (p) => p.paymentMethod === EPaymentMethod.MANUAL,
      ).length,
      totalRevenue,
    };

    return stats;
  }

  @Get(':id')
  @ForAdmin()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  async getPaymentById(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.getPaymentById(id);
    return this.mapToResponse(payment);
  }

  @Post(':id/refund')
  @ForAdmin()
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded',
    type: PaymentResponseDto,
  })
  async refundPayment(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.refundPayment(id, reason);
    return this.mapToResponse(payment);
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

