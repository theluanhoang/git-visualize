'use client';

import { LessonForm } from '@/components/forms/LessonForm';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useProAccess } from '@/hooks/use-pro-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function NewLessonPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isPro, isLoading } = useProAccess();

  if (isLoading) {
    return (
      <PrivateRoute showAccessDenied={false}>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PrivateRoute>
    );
  }

  if (!isPro) {
    return (
      <PrivateRoute showAccessDenied={false}>
        <div className="container mx-auto p-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <CardTitle className="text-2xl">Yêu cầu tài khoản Pro</CardTitle>
              <CardDescription>
                Bạn cần nâng cấp lên tài khoản Pro để tạo bài học
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/subscription">
                  Nâng cấp lên Pro
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute showAccessDenied={false}>
      <div className="container mx-auto px-4 py-6">
        <LessonForm redirectPath={`/${locale}/my-lessons`} />
      </div>
    </PrivateRoute>
  );
}
