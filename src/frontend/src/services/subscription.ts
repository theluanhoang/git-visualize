import api from '@/lib/api/axios';

export type SubscriptionPlanType = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';

export interface Subscription {
  id: string;
  userId: string;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  subscription: Subscription | null;
}

export interface CreateSubscriptionDto {
  planType: SubscriptionPlanType;
  autoRenew?: boolean;
}

export const SubscriptionsService = {
  async create(data: CreateSubscriptionDto): Promise<Subscription> {
    const response = await api.post<Subscription>('/api/v1/subscription', data);
    return response.data;
  },

  async getMySubscription(): Promise<Subscription | null> {
    try {
      const response = await api.get<Subscription>('/api/v1/subscription/my');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async checkStatus(): Promise<SubscriptionStatusResponse> {
    const response = await api.get<SubscriptionStatusResponse>('/api/v1/subscription/status');
    return response.data;
  },

  async cancel(subscriptionId: string): Promise<Subscription> {
    const response = await api.patch<Subscription>(`/api/v1/subscription/${subscriptionId}/cancel`);
    return response.data;
  },

  async renew(subscriptionId: string): Promise<Subscription> {
    const response = await api.post<Subscription>(`/api/v1/subscription/${subscriptionId}/renew`);
    return response.data;
  },
};








