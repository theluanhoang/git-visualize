import api from '@/lib/api/axios';

export type PaymentMethod = 'CASSO' | 'MANUAL';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  description?: string | null;
  paymentDate?: string | null;
  paymentUrl?: string | null;
  qrCode?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  subscriptionId: string;
}

export interface CreateSubscriptionWithPaymentDto {
  planType: 'MONTHLY' | 'YEARLY';
  autoRenew?: boolean;
}

export interface VerifyPaymentDto {
  transactionId: string;
}


export const PaymentsService = {
  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await api.post<Payment>('/api/v1/subscription/payment', data);
    return response.data;
  },

  async createSubscriptionWithPayment(data: CreateSubscriptionWithPaymentDto): Promise<Payment> {
    const response = await api.post<Payment>('/api/v1/subscription/payment/create-subscription', data);
    return response.data;
  },

  async getById(paymentId: string): Promise<Payment> {
    const response = await api.get<Payment>(`/api/v1/subscription/payment/${paymentId}`);
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
