'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import LessonViewer from '@/components/common/git-theory/LessonViewer';
import LessonNavigation from '@/components/common/git-theory/LessonNavigation';
import PracticeCTA from '@/components/common/git-theory/PracticeCTA';
import QuizCTA from '@/components/common/git-theory/QuizCTA';

export const dynamic = 'force-dynamic';

export default function LessonPage() {
    const router = useRouter();
    const { slug } = useParams<{ slug: string }>();
    const { data: lessonData, isLoading, error } = useLessons({
        slug: slug,
        status: 'published'
    });

    const { data: listData } = useLessons({
        limit: 100,
        offset: 0,
        status: 'published'
    });

    const lesson = lessonData?.[0];
    const sortedLessons = listData ? [...listData].sort((a: any, b: any) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id ?? 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id ?? 0;
        return aTime - bTime;
    }) : [];

    if (isLoading) return <div className="p-4">Đang tải bài học...</div>;
    if (error || !lesson) return <div className="p-4 text-red-500">Không tìm thấy bài học</div>;

    return (
        <div className="p-0">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6 md:p-6 mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{lesson.title}</h1>
                {lesson.description && (
                    <p className="text-muted-foreground mt-1 text-sm md:text-base leading-relaxed">{lesson.description}</p>
                )}
            </div>
            <div>
                <LessonViewer content={lesson.content} />
            </div>
            
            {/* Show both CTAs for first lesson and near-last lessons (last 2 lessons) */}
            {(() => {
                const currentIndex = sortedLessons.findIndex((l: any) => l.slug === slug);
                const isFirstLesson = currentIndex === 0;
                const isNearLast = currentIndex >= sortedLessons.length - 2 && currentIndex >= 0;
                
                if (isFirstLesson || isNearLast) {
                    return (
                        <div className="mt-6 space-y-4">
                            <QuizCTA slug={slug} />
                            <PracticeCTA slug={slug} />
                        </div>
                    );
                }
                
                // Show only PracticeCTA for other lessons
                return (
                    <div className="mt-6">
                        <PracticeCTA slug={slug} />
                    </div>
                );
            })()}
            {sortedLessons.length > 0 && (
                <div className="mt-6">
                    <LessonNavigation
                        onPrev={() => {
                            const idx = sortedLessons.findIndex((l: any) => l.slug === slug);
                            if (idx > 0) router.push(`/git-theory/${sortedLessons[idx - 1].slug}`);
                        }}
                        onNext={() => {
                            const idx = sortedLessons.findIndex((l: any) => l.slug === slug);
                            if (idx < sortedLessons.length - 1) router.push(`/git-theory/${sortedLessons[idx + 1].slug}`);
                        }}
                        prevDisabled={sortedLessons.findIndex((l: any) => l.slug === slug) <= 0}
                        nextDisabled={sortedLessons.findIndex((l: any) => l.slug === slug) >= sortedLessons.length - 1}
                    />
                </div>
            )}
        </div>
    );
}
