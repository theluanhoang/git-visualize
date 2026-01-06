'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SubscriptionCancelContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="container mx-auto p-4 py-8 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-3xl">Thanh toán không thành công</CardTitle>
          <CardDescription className="text-lg">
            {error || 'Thanh toán đã bị hủy hoặc có lỗi xảy ra'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/subscription">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Thử lại
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                Về trang chủ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionCancelPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500 animate-pulse" />
            </div>
            <CardTitle className="text-3xl">Đang tải...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <SubscriptionCancelContent />
    </Suspense>
  );
}













