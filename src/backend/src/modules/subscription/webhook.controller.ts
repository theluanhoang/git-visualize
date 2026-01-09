import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CassoService } from './casso.service';
import type { CassoWebhookData } from './casso.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly cassoService: CassoService,
  ) {}

  @Post('casso')
  @ApiOperation({ summary: 'Handle Casso webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleCassoWebhook(
    @Body() webhookData: CassoWebhookData,
    @Headers('x-casso-signature') signature?: string,
  ) {
    this.logger.log(
      `🔔 [WebhookController] Received Casso webhook`,
      {
        webhookData,
        hasSignature: !!signature,
        timestamp: new Date().toISOString(),
      },
    );

    try {
      this.logger.log(
        `[WebhookController] Calling paymentService.handleCassoWebhook...`,
        {
          webhookId: (webhookData as any).id || (webhookData as any).data?.id,
          timestamp: new Date().toISOString(),
        },
      );

      const payment = await this.paymentService.handleCassoWebhook(
        webhookData,
        signature,
      );

      this.logger.log(
        `✅ [WebhookController] Processed payment ${payment.id} from Casso webhook`,
        {
          paymentId: payment.id,
          paymentStatus: payment.status,
          userId: payment.userId,
          amount: payment.amount,
          timestamp: new Date().toISOString(),
        },
      );

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
      };
    } catch (error: any) {
      this.logger.error(
        `❌ [WebhookController] Error processing Casso webhook: ${error.message}`,
        {
          error: error.message,
          stack: error.stack,
          webhookData,
          timestamp: new Date().toISOString(),
        },
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
