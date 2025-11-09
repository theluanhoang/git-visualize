'use client';
import React, { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLessons, useTrackLessonView, useHasViewedLesson } from '@/lib/react-query/hooks/use-lessons';
import LessonViewer from '@/components/common/git-theory/LessonViewer';
import LessonNavigation from '@/components/common/git-theory/LessonNavigation';
import PracticeCTA from '@/components/common/git-theory/PracticeCTA';
import RatingDisplay from '@/components/common/git-theory/RatingDisplay';
import { Badge } from '@/components/ui/badge';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { CheckCircle2, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
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

    const trackViewMutation = useTrackLessonView();
    const hasTrackedRef = useRef(false);
    const trackedLessonIdRef = useRef<string | null>(null);
    
    const accessToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
    const { data: hasViewedData } = useHasViewedLesson(String(lesson?.id || ''), !!lesson?.id && !!accessToken);

    useEffect(() => {
        if (!lesson?.id) return;

        if (trackedLessonIdRef.current === String(lesson.id)) return;

        const accessToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
        if (!accessToken) return;

        trackedLessonIdRef.current = String(lesson.id);
        
        trackViewMutation.mutate(String(lesson.id), {
            onError: (error) => {
                trackedLessonIdRef.current = null;
                console.debug('Failed to track lesson view:', error);
            },
        });
    }, [lesson?.id]);

    if (isLoading) return <div className="p-4">Đang tải bài học...</div>;
    if (error || !lesson) return <div className="p-4 text-red-500">Không tìm thấy bài học</div>;

    return (
        <div className="p-0">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 md:p-5 mb-4 md:mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{lesson.title}</h1>
                            {hasViewedData?.hasViewed && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    <span>Đã xem</span>
                                    {hasViewedData.viewCount > 1 && (
                                        <span className="text-xs">({hasViewedData.viewCount}x)</span>
                                    )}
                                </Badge>
                            )}
                        </div>
                        {lesson.description && (
                            <p className="text-muted-foreground mt-1 text-sm md:text-base leading-relaxed">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{lesson.views || 0} lượt xem</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="-mx-0">
                <LessonViewer content={lesson.content} />
            </div>
            <div className="mt-6">
                <PracticeCTA slug={slug} />
            </div>
            {lesson?.id && (
                <div className="mt-6">
                    <RatingDisplay lessonId={String(lesson.id)} />
                </div>
            )}
            {sortedLessons.length > 0 && (
                <div className="mt-6">
                    <LessonNavigation
                        onPrev={() => {
                            const idx = sortedLessons.findIndex((l: any) => l.slug === slug);
                            if (idx > 0) router.push(`/${locale}/git-theory/${sortedLessons[idx - 1].slug}`);
                        }}
                        onNext={() => {
                            const idx = sortedLessons.findIndex((l: any) => l.slug === slug);
                            if (idx < sortedLessons.length - 1) router.push(`/${locale}/git-theory/${sortedLessons[idx + 1].slug}`);
                        }}
                        prevDisabled={sortedLessons.findIndex((l: any) => l.slug === slug) <= 0}
                        nextDisabled={sortedLessons.findIndex((l: any) => l.slug === slug) >= sortedLessons.length - 1}
                    />
                </div>
            )}
        </div>
    );
}
