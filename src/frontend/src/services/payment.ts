import api from '@/lib/api/axios';

export type PaymentMethod = 'STRIPE' | 'PAYPAL' | 'VNPAY' | 'MANUAL';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paymentDate?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
  paymentUrl?: string; // Added by backend when creating payment
}

export interface CreatePaymentDto {
  subscriptionId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface VerifyPaymentDto {
  transactionId: string;
}

export const PaymentsService = {
  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await api.post<Payment>('/api/v1/subscription/payment', data);
    return response.data;
  },

  async verify(paymentId: string, transactionId: string): Promise<Payment> {
    const response = await api.post<Payment>(`/api/v1/subscription/payment/${paymentId}/verify`, {
      transactionId,
    });
    return response.data;
  },

  async getMyPayments(): Promise<Payment[]> {
    const response = await api.get<Payment[]>('/api/v1/subscription/payment/my');
    return response.data;
  },
};
