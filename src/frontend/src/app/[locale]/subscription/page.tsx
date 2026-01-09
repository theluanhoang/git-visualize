'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useMySubscription } from '@/hooks/use-subscription';
import { useCreateSubscriptionWithPayment } from '@/hooks/use-payment';
import { useProAccess } from '@/hooks/use-pro-access';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Crown, Loader2, BookOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { SubscriptionPlanType } from '@/services/subscription';
import { PaymentQRModal } from '@/components/subscription/PaymentQRModal';
import type { Payment } from '@/services/payment';

const PRICING = {
  MONTHLY: 99000,
  YEARLY: 990000,
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: subscription, isLoading: isLoadingSubscription } = useMySubscription();
  const { isPro, subscription: proSubscription } = useProAccess();
  const createSubscriptionWithPayment = useCreateSubscriptionWithPayment();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('MONTHLY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký');
      return;
    }

    if (isPro) {
      toast.info('Bạn đã có tài khoản Pro');
      return;
    }

    setIsProcessing(true);
    try {
      // Tạo subscription và payment cùng lúc
      const paymentData = await createSubscriptionWithPayment.mutateAsync({
        planType: selectedPlan,
        autoRenew: true,
      });

      // Hiển thị modal thanh toán với QR code
      setPayment(paymentData);
      setShowPaymentModal(true);
      toast.success('Vui lòng thanh toán để hoàn tất nâng cấp');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Invalidate và refetch subscription data
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    
    // Refresh sau 1 giây để đảm bảo data được cập nhật
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (isLoadingSubscription) {
    return (
      <PrivateRoute showAccessDenied={false}>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute showAccessDenied={false}>
      <div className="container mx-auto p-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Nâng Cấp Lên Pro</h1>
          <p className="text-muted-foreground">
            Mở khóa toàn bộ tính năng và tự tạo bài học của riêng bạn
          </p>
        </div>

        {isPro && proSubscription ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <CardTitle>Bạn đã có tài khoản Pro</CardTitle>
                </div>
                <CardDescription>
                  Tài khoản Pro của bạn đang hoạt động
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gói đăng ký:</span>
                  <Badge variant="secondary">{proSubscription.planType === 'MONTHLY' ? 'Gói Tháng' : 'Gói Năm'}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ngày hết hạn:</span>
                    <span className="font-medium">{new Date(proSubscription.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {(() => {
                    const endDate = new Date(proSubscription.endDate);
                    const now = new Date();
                    const diffTime = endDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) {
                      return (
                        <div className="text-sm text-red-500 font-medium">
                          ⚠️ Đã hết hạn
                        </div>
                      );
                    } else if (diffDays <= 7) {
                      return (
                        <div className="text-sm text-orange-500 font-medium">
                          ⏰ Còn {diffDays} ngày
                        </div>
                      );
                    } else if (diffDays <= 30) {
                      return (
                        <div className="text-sm text-yellow-600 font-medium">
                          Còn {diffDays} ngày
                        </div>
                      );
                    } else {
                      const months = Math.floor(diffDays / 30);
                      const days = diffDays % 30;
                      return (
                        <div className="text-sm text-green-600 font-medium">
                          ✓ Còn {months > 0 ? `${months} tháng${months > 1 ? '' : ''}` : ''} {days > 0 ? `${days} ngày` : ''}
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tự động gia hạn:</span>
                  <span>{proSubscription.autoRenew ? 'Có' : 'Không'}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/my-lessons">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Quản lý bài học
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/my-lessons/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo bài học mới
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tính năng Pro của bạn</CardTitle>
                <CardDescription>
                  Bạn đang sử dụng các tính năng sau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Tự tạo bài học không giới hạn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Quản lý và chỉnh sửa bài học của bạn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Practice sessions không giới hạn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>AI Assistant không giới hạn</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <Card className={selectedPlan === 'MONTHLY' ? 'border-primary ring-2 ring-primary' : ''}>
              <CardHeader>
                <CardTitle>Gói Tháng</CardTitle>
                <CardDescription>Thanh toán hàng tháng</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{PRICING.MONTHLY.toLocaleString('vi-VN')}</span>
                  <span className="text-muted-foreground ml-2">VND/tháng</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Tự tạo bài học không giới hạn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Quản lý bài học của bạn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Practice sessions không giới hạn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>AI Assistant không giới hạn</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={selectedPlan === 'MONTHLY' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan('MONTHLY')}
                >
                  {selectedPlan === 'MONTHLY' ? 'Đã chọn' : 'Chọn gói này'}
                </Button>
              </CardFooter>
            </Card>

            {/* Yearly Plan */}
            <Card className={selectedPlan === 'YEARLY' ? 'border-primary ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Gói Năm</CardTitle>
                  <Badge variant="default">Tiết kiệm 2 tháng</Badge>
                </div>
                <CardDescription>Thanh toán hàng năm</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{PRICING.YEARLY.toLocaleString('vi-VN')}</span>
                  <span className="text-muted-foreground ml-2">VND/năm</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Chỉ {Math.round(PRICING.YEARLY / 12).toLocaleString('vi-VN')} VND/tháng
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Tất cả tính năng gói tháng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Tiết kiệm 198,000 VND/năm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Ưu tiên hỗ trợ</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={selectedPlan === 'YEARLY' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan('YEARLY')}
                >
                  {selectedPlan === 'YEARLY' ? 'Đã chọn' : 'Chọn gói này'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {!isPro && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Nâng cấp Pro ngay
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Tài khoản Pro sẽ được kích hoạt sau khi thanh toán thành công
            </p>
          </div>
        )}

        {/* Payment QR Modal */}
        <PaymentQRModal
          payment={payment}
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </PrivateRoute>
  );
}

