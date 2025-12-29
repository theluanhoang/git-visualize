'use client';
import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLessons, useMyLessons, useTrackLessonView, useHasViewedLesson } from '@/lib/react-query/hooks/use-lessons';
import LessonViewer from '@/components/common/git-theory/LessonViewer';
import LessonNavigation from '@/components/common/git-theory/LessonNavigation';
import PracticeCTA from '@/components/common/git-theory/PracticeCTA';
import QuizCTA from '@/components/common/git-theory/QuizCTA';
import RatingDisplay from '@/components/common/git-theory/RatingDisplay';
import { Badge } from '@/components/ui/badge';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { CheckCircle2, Eye } from 'lucide-react';
import { useProAccess } from '@/hooks/use-pro-access';

export const dynamic = 'force-dynamic';

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const { slug } = useParams<{ slug: string }>();
    const { isPro } = useProAccess();
    
    // When querying by slug, don't filter by status
    // Backend will handle filtering: pro users see their own lessons OR public admin lessons
    // This matches the behavior in quiz and practice pages
    const { data: lessonData, isLoading: isLoadingLesson, error } = useLessons({
        slug: slug,
        // Don't filter by status - let backend handle it based on user permissions
        // Backend logic: when querying by slug with userId, it returns:
        // - User's own lesson (authorId = userId) OR
        // - Public admin lesson (isPublic = true AND authorId IS NULL)
        enabled: !!slug
    });

    // Also query from myLessons as fallback for pro users
    const { data: myLessonsData, isLoading: isLoadingMyLessons } = useMyLessons({
        limit: 100,
        offset: 0,
        enabled: isPro && !!slug
    });

    // Find lesson from myLessons if not found in main query
    const lessonFromMyLessons = useMemo(() => {
        if (!slug || !myLessonsData?.data) return null;
        return myLessonsData.data.find((l: any) => l.slug === slug && l.status === 'published') || null;
    }, [slug, myLessonsData]);

    const { data: listData } = useLessons({
        limit: 100,
        offset: 0,
        status: 'published'
    });

    // Use lesson from main query, or fallback to myLessons
    const lesson = lessonData?.[0] || lessonFromMyLessons;
    const isLoading = isLoadingLesson || (isPro && isLoadingMyLessons);
    
    // Merge myLessons into listData for navigation, avoiding duplicates
    const sortedLessons = useMemo(() => {
        const publicLessons = listData || [];
        const myLessons = myLessonsData?.data 
            ? myLessonsData.data.filter((l: any) => l.status === 'published')
            : [];
        
        // Create a map of slugs to avoid duplicates
        const lessonMap = new Map<string, any>();
        
        // First add public lessons
        publicLessons.forEach((l: any) => {
            lessonMap.set(l.slug, l);
        });
        
        // Then add myLessons (will overwrite if same slug)
        myLessons.forEach((l: any) => {
            lessonMap.set(l.slug, l);
        });
        
        // Convert to array and sort
        return Array.from(lessonMap.values()).sort((a: any, b: any) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id ?? 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id ?? 0;
            return aTime - bTime;
        });
    }, [listData, myLessonsData]);

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
    if ((error || !lesson) && !isLoading) {
        return (
            <div className="p-4 text-red-500">
                <p>Không tìm thấy bài học</p>
                {error && <p className="text-sm mt-2">Lỗi: {String(error)}</p>}
                {lessonData && lessonData.length === 0 && !lessonFromMyLessons && <p className="text-sm mt-2">Không có dữ liệu trả về từ API (mảng rỗng)</p>}
                {!lessonData && !lessonFromMyLessons && !isLoading && <p className="text-sm mt-2">Không có dữ liệu trả về từ API (null/undefined)</p>}
                <div className="text-xs mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <p>Debug info:</p>
                    <p>slug: {slug}</p>
                    <p>lessonData length: {lessonData?.length ?? 'null'}</p>
                    <p>lessonFromMyLessons: {lessonFromMyLessons ? 'found' : 'not found'}</p>
                    <p>isPro: {String(isPro)}</p>
                    <p>isLoadingLesson: {String(isLoadingLesson)}</p>
                    <p>isLoadingMyLessons: {String(isLoadingMyLessons)}</p>
                </div>
            </div>
        );
    }

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
