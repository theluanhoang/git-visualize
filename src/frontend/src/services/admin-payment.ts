import api from '@/lib/api/axios';
import { Payment, PaymentMethod, PaymentStatus } from '@/services/payment';

export interface AdminPaymentQuery {
  page?: number;
  limit?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdminPaymentResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
}

export interface RefundDto {
  amount?: number;
  reason: string;
}

export const AdminPaymentsService = {
  async getAll(query: AdminPaymentQuery = {}): Promise<AdminPaymentResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.paymentStatus) params.append('paymentStatus', query.paymentStatus);
    if (query.paymentMethod) params.append('paymentMethod', query.paymentMethod);
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get<AdminPaymentResponse>(
      `/api/v1/admin/payments?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: string): Promise<Payment> {
    const response = await api.get<Payment>(`/api/v1/admin/payments/${id}`);
    return response.data;
  },

  async getStats(): Promise<PaymentStats> {
    const response = await api.get<PaymentStats>('/api/v1/admin/payments/stats');
    return response.data;
  },

  async getRevenueReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/api/v1/admin/payments/revenue?${params.toString()}`);
    return response.data;
  },

  async refund(id: string, data: RefundDto): Promise<Payment> {
    const response = await api.post<Payment>(`/api/v1/admin/payments/${id}/refund`, data);
    return response.data;
  },
};

