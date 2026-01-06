'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { subscriptionKeys } from '@/hooks/use-subscription';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Invalidate subscription queries to refresh data
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
  }, [queryClient]);

  return (
    <div className="container mx-auto p-4 py-8 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Thanh toán thành công!</CardTitle>
          <CardDescription className="text-lg">
            Chúc mừng! Bạn đã nâng cấp lên tài khoản Pro thành công
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactionId && (
            <p className="text-sm text-muted-foreground">
              Mã giao dịch: {transactionId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/my-lessons">
                Tạo bài học ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/git-theory">
                Xem bài học
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}













