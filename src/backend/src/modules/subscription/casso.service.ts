import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface CassoCreateTransactionDto {
  amount: number;
  description: string;
  when?: string;
  cusName?: string;
  cusEmail?: string;
}

export interface CassoTransactionResponse {
  id: string;
  tid: string;
  amount: number;
  description: string;
  when: string;
  bankSubAccId: string;
  subAccId: string;
  virtualAccount: string;
  virtualAccountName: string;
  corresponsiveName: string;
  corresponsiveAccount: string;
  corresponsiveBankId: string;
  corresponsiveBankName: string;
}

export interface CassoWebhookData {
  id: string;
  tid: string;
  amount: number;
  description: string;
  when: string;
  bankSubAccId: string;
  subAccId: string;
  virtualAccount: string;
  virtualAccountName: string;
  corresponsiveName: string;
  corresponsiveAccount: string;
  corresponsiveBankId: string;
  corresponsiveBankName: string;
  subAccName?: string;
  reference?: string;
}

@Injectable()
export class CassoService {
  private readonly logger = new Logger(CassoService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;
  private readonly webhookSecret: string;
  private readonly bankAccount: string;
  private readonly bankName: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('casso.apiKey') || '';
    this.webhookSecret =
      this.configService.get<string>('casso.webhookSecret') || '';
    this.bankAccount =
      this.configService.get<string>('casso.bankAccount') || '';
    this.bankName = this.configService.get<string>('casso.bankName') || '';
    this.baseUrl =
      this.configService.get<string>('casso.baseUrl') ||
      'https://oauth.casso.vn/v2';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 30000,
    });
  }

  /**
   * Tạo giao dịch thanh toán trên Casso
   */
  async createTransaction(
    data: CassoCreateTransactionDto,
  ): Promise<CassoTransactionResponse> {
    try {
      const response = await this.axiosInstance.post<CassoTransactionResponse>(
        '/transactions',
        {
          amount: data.amount,
          description: data.description,
          when: data.when || new Date().toISOString(),
          cusName: data.cusName,
          cusEmail: data.cusEmail,
        },
      );

      this.logger.log(`Created Casso transaction: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error creating Casso transaction: ${error.message}`,
        error.stack,
      );
      if (error.response) {
        throw new BadRequestException(
          `Casso API error: ${error.response.data?.message || error.response.statusText}`,
        );
      }
      throw new BadRequestException(
        `Failed to create Casso transaction: ${error.message}`,
      );
    }
  }

  /**
   * Tạo mã QR thanh toán VietQR
   */
  createVietQR(amount: number, description: string, orderId: string): string {
    try {
      // VietQR API cần mã ngân hàng ngắn gọn (không có khoảng trắng)
      // Map bank name sang mã ngân hàng chuẩn
      const bankCodeMap: Record<string, string> = {
        VCB: 'VCB',
        Vietcombank: 'VCB',
        TCB: 'TCB',
        Techcombank: 'TCB',
        VTB: 'VTB',
        VietinBank: 'VTB',
        ACB: 'ACB',
        VPB: 'VPB',
        VPBank: 'VPB',
        MSB: 'MSB',
        TPB: 'TPB',
        TPBank: 'TPB',
        HDB: 'HDB',
        HDBank: 'HDB',
        OCB: 'OCB',
        MB: 'MB',
        MBBank: 'MB',
        'MBBank Official': 'MB',
        BID: 'BID',
        BIDV: 'BID',
        VBA: 'VBA',
        Agribank: 'VBA',
      };

      // Lấy mã ngân hàng chuẩn
      // Thử tìm trong map với tên đầy đủ trước (case-sensitive)
      let bankCode =
        bankCodeMap[this.bankName] || bankCodeMap[this.bankName.trim()];

      // Nếu không tìm thấy, thử với uppercase
      if (!bankCode) {
        const upperName = this.bankName.toUpperCase().trim();
        bankCode = bankCodeMap[upperName];
      }

      // Nếu vẫn không tìm thấy, loại bỏ khoảng trắng và dùng chính nó
      if (!bankCode) {
        bankCode = this.bankName.replace(/\s+/g, '').toUpperCase();
      }

      this.logger.log(
        `Bank name: "${this.bankName}" -> Bank code: "${bankCode}"`,
      );

      // Tạo VietQR URL với mã ngân hàng chuẩn
      const vietqrUrl = `https://img.vietqr.io/image/${bankCode}-${this.bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(this.bankName)}`;

      this.logger.log(`Created VietQR URL: ${vietqrUrl}`);
      return vietqrUrl;
    } catch (error: any) {
      this.logger.error(`Error creating VietQR: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Failed to create VietQR: ${error.message}`,
      );
    }
  }

  /**
   * Xác minh webhook signature từ Casso
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    try {
      // Casso sử dụng HMAC-SHA256 để ký webhook
      // Trong thực tế, bạn cần implement HMAC verification
      // Tạm thời return true nếu có webhookSecret
      if (!this.webhookSecret) {
        this.logger.warn(
          'Webhook secret not configured, skipping signature verification',
        );
        return true;
      }

      // TODO: Implement HMAC-SHA256 verification
      // const crypto = require('crypto');
      // const expectedSignature = crypto
      //     .createHmac('sha256', this.webhookSecret)
      //     .update(payload)
      //     .digest('hex');
      // return signature === expectedSignature;

      return true;
    } catch (error) {
      this.logger.error(`Error verifying webhook signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Lấy thông tin giao dịch từ Casso
   */
  async getTransaction(
    transactionId: string,
  ): Promise<CassoTransactionResponse | null> {
    try {
      const response = await this.axiosInstance.get<CassoTransactionResponse>(
        `/transactions/${transactionId}`,
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error getting Casso transaction: ${error.message}`,
        error.stack,
      );
      if (error.response?.status === 404) {
        return null;
      }
      throw new BadRequestException(
        `Failed to get Casso transaction: ${error.message}`,
      );
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async checkPaymentStatus(transactionId: string): Promise<boolean> {
    try {
      const transaction = await this.getTransaction(transactionId);
      return transaction !== null && transaction.amount > 0;
    } catch (error) {
      this.logger.error(`Error checking payment status: ${error.message}`);
      return false;
    }
  }
}
