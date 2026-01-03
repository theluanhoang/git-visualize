import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionsService, CreateSubscriptionDto, Subscription } from '@/services/subscription';
import { PaymentsService, CreatePaymentDto, Payment } from '@/services/payment';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  my: () => [...subscriptionKeys.all, 'my'] as const,
  status: () => [...subscriptionKeys.all, 'status'] as const,
  payments: () => [...subscriptionKeys.all, 'payments'] as const,
};

export function useMySubscription() {
  return useQuery({
    queryKey: subscriptionKeys.my(),
    queryFn: () => SubscriptionsService.getMySubscription(),
  });
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: () => SubscriptionsService.checkStatus(),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionDto) => SubscriptionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => SubscriptionsService.cancel(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => SubscriptionsService.renew(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: subscriptionKeys.payments(),
    queryFn: () => PaymentsService.getMyPayments(),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => PaymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.payments() });
    },
  });
}













