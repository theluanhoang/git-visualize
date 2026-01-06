'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useProAccess } from '@/hooks/use-pro-access';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { lessonKeys } from '@/lib/react-query/query-keys';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Eye, Edit, Trash2, Crown, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LessonsService } from '@/services/lessons';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function MyLessonsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isPro, isLoading: isLoadingPro, expiresAt } = useProAccess();
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: lessonsData, isLoading } = useQuery({
    queryKey: [...lessonKeys.all, 'my', { limit, offset: page * limit }],
    queryFn: async () => {
      const response = await api.get('/api/v1/lesson/my-lessons', {
        params: { limit, offset: page * limit },
      });
      // Map status from backend format (PUBLISHED/DRAFT) to frontend format (published/draft)
      const data = response.data?.data || [];
      const mappedData = data.map((lesson: any) => ({
        ...lesson,
        status: lesson.status === 'PUBLISHED' ? 'published' : 
                lesson.status === 'DRAFT' ? 'draft' : 
                lesson.status === 'REMOVED' ? 'draft' : 'draft',
      }));
      return {
        ...response.data,
        data: mappedData,
      };
    },
    enabled: isPro,
  });

  const lessons = lessonsData?.data || [];
  const total = lessonsData?.total || 0;
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; lessonId: string | null; lessonTitle: string }>({
    open: false,
    lessonId: null,
    lessonTitle: '',
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => LessonsService.delete(lessonId),
    onSuccess: () => {
      toast.success('Bài học đã được xóa thành công');
      queryClient.invalidateQueries({ queryKey: [...lessonKeys.all, 'my'] });
      setDeleteDialog({ open: false, lessonId: null, lessonTitle: '' });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa bài học');
    },
  });

  const handleDeleteClick = (lessonId: string, lessonTitle: string) => {
    setDeleteDialog({ open: true, lessonId, lessonTitle });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.lessonId) {
      deleteLessonMutation.mutate(deleteDialog.lessonId);
    }
  };

  if (isLoadingPro) {
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
        <div className="container mx-auto p-4 py-8 max-w-3xl">
          <Card className="border-primary">
            <CardHeader className="text-center">
              <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <CardTitle className="text-3xl mb-2">Yêu cầu tài khoản Pro</CardTitle>
              <CardDescription className="text-base">
                Bạn cần nâng cấp lên tài khoản Pro để tạo và quản lý bài học của riêng mình
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Với tài khoản Pro, bạn có thể:</h3>
                <ul className="space-y-2">
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
              </div>
              <div className="text-center space-y-4">
                <Button size="lg" asChild className="min-w-[200px]">
                  <Link href="/subscription">
                    <Crown className="mr-2 h-5 w-5" />
                    Nâng cấp lên Pro ngay
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Tài khoản Pro sẽ được kích hoạt ngay sau khi đăng ký
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute showAccessDenied={false}>
      <div className="container mx-auto p-4 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">Bài học của tôi</h1>
                <Badge variant="default" className="bg-yellow-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  Quản lý các bài học bạn đã tạo
                </p>
                {expiresAt && (
                  <Badge variant="outline" className="text-xs">
                    {(() => {
                      const endDate = expiresAt;
                      const now = new Date();
                      const diffTime = endDate.getTime() - now.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays < 0) {
                        return '⚠️ Đã hết hạn';
                      } else if (diffDays <= 7) {
                        return `⏰ Hết hạn sau ${diffDays} ngày`;
                      } else if (diffDays <= 30) {
                        return `Hết hạn sau ${diffDays} ngày`;
                      } else {
                        const months = Math.floor(diffDays / 30);
                        return `Hết hạn sau ${months} tháng`;
                      }
                    })()}
                  </Badge>
                )}
              </div>
            </div>
            <Button asChild>
              <Link href="/my-lessons/new">
                <Plus className="mr-2 h-4 w-4" />
                Tạo bài học mới
              </Link>
            </Button>
          </div>
          {lessons.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Tổng cộng: <span className="font-semibold text-foreground">{total}</span> bài học
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có bài học nào</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Bắt đầu tạo bài học đầu tiên của bạn và chia sẻ kiến thức với cộng đồng
              </p>
              <Button size="lg" asChild>
                <Link href="/my-lessons/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài học mới
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson: any) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                      <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
                        {lesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                    </div>
                    {lesson.description && (
                      <CardDescription className="line-clamp-2">
                        {lesson.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{lesson.views || 0} lượt xem</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/git-theory/${lesson.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/my-lessons/${lesson.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Sửa
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteLessonMutation.isPending}
                        onClick={() => handleDeleteClick(lesson.id, lesson.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {total > limit && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <span className="flex items-center px-4">
                  Trang {page + 1} / {Math.ceil(total / limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= total}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}

        <ConfirmDialog
          open={deleteDialog.open}
          title="Xác nhận xóa bài học"
          description={`Bạn có chắc chắn muốn xóa bài học "${deleteDialog.lessonTitle}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          loading={deleteLessonMutation.isPending}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteDialog({ open: false, lessonId: null, lessonTitle: '' })}
        />
      </div>
    </PrivateRoute>
  );
}
