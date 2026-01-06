import api from '@/lib/api/axios';
import { Subscription, SubscriptionPlanType, SubscriptionStatus } from '@/services/subscription';
import { Payment, PaymentMethod, PaymentStatus } from '@/services/payment';

export interface AdminSubscriptionQuery {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  planType?: SubscriptionPlanType;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdminSubscriptionResponse {
  data: Subscription[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  cancelled: number;
  expired: number;
  pending: number;
  monthly: number;
  yearly: number;
}

export interface ExtendSubscriptionDto {
  days: number;
}

export const AdminSubscriptionsService = {
  async getAll(query: AdminSubscriptionQuery = {}): Promise<AdminSubscriptionResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.status) params.append('status', query.status);
    if (query.planType) params.append('planType', query.planType);
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get<AdminSubscriptionResponse>(
      `/api/v1/admin/subscriptions?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: string): Promise<Subscription> {
    const response = await api.get<Subscription>(`/api/v1/admin/subscriptions/${id}`);
    return response.data;
  },

  async getStats(): Promise<SubscriptionStats> {
    const response = await api.get<SubscriptionStats>('/api/v1/admin/subscriptions/stats');
    return response.data;
  },

  async activate(id: string): Promise<Subscription> {
    const response = await api.post<Subscription>(`/api/v1/admin/subscriptions/${id}/activate`);
    return response.data;
  },

  async deactivate(id: string): Promise<Subscription> {
    const response = await api.post<Subscription>(`/api/v1/admin/subscriptions/${id}/deactivate`);
    return response.data;
  },

  async extend(id: string, days: number): Promise<Subscription> {
    const response = await api.post<Subscription>(`/api/v1/admin/subscriptions/${id}/extend`, {
      days,
    });
    return response.data;
  },

  async cancel(id: string): Promise<Subscription> {
    const response = await api.post<Subscription>(`/api/v1/admin/subscriptions/${id}/cancel`);
    return response.data;
  },

  async getProUsers(query: { page?: number; limit?: number; search?: string } = {}) {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);

    const response = await api.get(`/api/v1/admin/subscriptions/pro-users?${params.toString()}`);
    return response.data;
  },
};



