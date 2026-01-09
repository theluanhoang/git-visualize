import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentsService, Payment, CreatePaymentDto, CreateSubscriptionWithPaymentDto, VerifyPaymentDto } from '@/services/payment';
import { subscriptionKeys } from './use-subscription';

export const paymentKeys = {
  all: ['payments'] as const,
  my: () => [...paymentKeys.all, 'my'] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
};

export function useMyPayments() {
  return useQuery({
    queryKey: paymentKeys.my(),
    queryFn: () => PaymentsService.getMyPayments(),
  });
}

export function usePayment(paymentId: string, options?: { refetchInterval?: number | false | ((data: Payment | undefined) => number | false); enabled?: boolean }) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => PaymentsService.getById(paymentId),
    enabled: options?.enabled !== false && !!paymentId,
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePaymentDto) => PaymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

export function useCreateSubscriptionWithPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionWithPaymentDto) => 
      PaymentsService.createSubscriptionWithPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, transactionId }: { paymentId: string; transactionId: string }) =>
      PaymentsService.verify(paymentId, transactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.paymentId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

