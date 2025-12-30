import { useSubscriptionStatus } from './use-subscription';
import { useAuth } from '@/contexts/AuthContext';

export function useProAccess() {
  const { data: statusData, isLoading } = useSubscriptionStatus();
  const { user } = useAuth();

  const hasProAccess = statusData?.hasActiveSubscription ?? false;
  const subscription = statusData?.subscription ?? null;
  const isPro = hasProAccess && subscription?.status === 'ACTIVE';

  return {
    isPro,
    hasProAccess,
    subscription,
    isLoading: isLoading || !user,
    isExpired: subscription?.status === 'EXPIRED',
    expiresAt: subscription?.endDate ? new Date(subscription.endDate) : null,
  };
}










