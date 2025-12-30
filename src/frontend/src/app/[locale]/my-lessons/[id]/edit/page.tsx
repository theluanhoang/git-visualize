'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { lessonKeys } from '@/lib/react-query/query-keys';
import { LessonsService } from '@/services/lessons';
import { LessonForm } from '@/components/forms/LessonForm';
import api from '@/lib/api/axios';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useProAccess } from '@/hooks/use-pro-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function EditLessonPage() {
    const { id } = useParams<{ id: string }>();
    const { isPro, isLoading: isLoadingPro } = useProAccess();

    const { data: lesson, isLoading, error } = useQuery({
        queryKey: [...lessonKeys.all, 'my', id],
        queryFn: async () => {
            // First, get the lesson from my-lessons to get the slug
            const response = await api.get('/api/v1/lesson/my-lessons', {
                params: { limit: 1000, offset: 0 },
            });
            const lessons = response.data?.data || [];
            const foundLesson = lessons.find((l: any) => l.id === id);
            
            if (!foundLesson) {
                return null;
            }

            // Get full lesson data with practices using slug (same as admin)
            // This ensures practices are loaded correctly
            const fullLesson = await LessonsService.getBySlugWithPractices(foundLesson.slug);
            
            if (fullLesson) {
                // Ensure practices are included
                return {
                    ...fullLesson,
                    practices: fullLesson.practices || [],
                };
            }
            
            // Fallback: map status from backend format if fullLesson is not available
            return {
                ...foundLesson,
                status: foundLesson.status === 'PUBLISHED' ? 'published' : 
                        foundLesson.status === 'DRAFT' ? 'draft' : 
                        'draft',
                practices: [],
            };
        },
        enabled: Boolean(id) && isPro,
    });

    if (isLoadingPro || isLoading) {
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
                                Bạn cần nâng cấp lên tài khoản Pro để chỉnh sửa bài học
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

    if (error || !lesson) {
        return (
            <PrivateRoute showAccessDenied={false}>
                <div className="container mx-auto p-4">
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-red-500 mb-4">Không tìm thấy bài học hoặc bạn không có quyền chỉnh sửa bài học này</p>
                            <Button asChild variant="outline">
                                <Link href="/my-lessons">Quay lại danh sách</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PrivateRoute>
        );
    }

    const params = useParams();
    const locale = (params.locale as string) || 'en';

    return (
        <PrivateRoute showAccessDenied={false}>
            <div className="container mx-auto px-4 py-6">
                <LessonForm 
                    initialData={lesson} 
                    isEdit={true} 
                    lessonId={lesson.id} 
                    redirectPath={`/${locale}/my-lessons`}
                />
            </div>
        </PrivateRoute>
    );
}
