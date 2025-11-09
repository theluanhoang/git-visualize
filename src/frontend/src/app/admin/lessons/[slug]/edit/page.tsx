'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { lessonKeys } from '@/lib/react-query/query-keys';
import { LessonsService } from '@/services/lessons';
import { LessonForm } from '@/components/forms/LessonForm';

export const dynamic = 'force-dynamic';

export default function EditLessonPage() {
    const router = useRouter();
    const { slug } = useParams<{ slug: string }>();

    const { data: lesson, isLoading, error } = useQuery({
        queryKey: lessonKeys.admin.edit(slug),
        queryFn: () => LessonsService.getBySlugWithPractices(slug),
        enabled: Boolean(slug),
    });

    if (isLoading) return <div className="p-4">Đang tải dữ liệu bài học...</div>;
    if (error || !lesson) return <div className="p-4 text-red-500">Không tìm thấy bài học</div>;

    return (
        <LessonForm initialData={lesson} isEdit={true} lessonId={lesson.id} />
    );
}
