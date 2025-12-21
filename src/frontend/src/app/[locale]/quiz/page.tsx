'use client';

import React from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import QuizSelector from "@/components/common/quiz/QuizSelector";
import { Quiz } from '@/services/quizzes';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import { SearchParamsProvider } from '@/components/common/SearchParamsProvider';

export const dynamic = 'force-dynamic';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const lessonSlug = searchParams.get('lesson');

  // Get all lessons to find the first one
  const { data: allLessonsData, isLoading: isLoadingAllLessons } = useLessons({
    limit: 100,
    offset: 0,
    status: 'published',
    includePractices: false
  });

  // Get selected lesson details
  const { data: lessonsData } = useLessons({ 
    slug: lessonSlug || undefined,
    includePractices: false 
  });
  
  const lesson = lessonsData?.[0];

  // Auto-select first lesson if no lesson is selected
  React.useEffect(() => {
    if (!isLoadingAllLessons && !lessonSlug && allLessonsData && allLessonsData.length > 0) {
      const sorted = [...allLessonsData].sort((a: any, b: any) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id ?? 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id ?? 0;
        return aTime - bTime; // oldest -> newest
      });
      const first = sorted[0];
      if (first?.slug) {
        router.replace(`/${locale}/quiz?lesson=${first.slug}`);
      }
    }
  }, [allLessonsData, isLoadingAllLessons, lessonSlug, router, locale]);

  const handleStartQuiz = (quiz: Quiz) => {
    const params = new URLSearchParams();
    if (lessonSlug) params.set('lesson', lessonSlug);
    params.set('quiz', quiz.id);
    
    router.push(`/${locale}/quiz/session?${params.toString()}`);
  };

  return (
    <div className="container mx-auto p-4">
      {lessonSlug && lesson && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
          {lesson.description && (
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
          )}
        </div>
      )}

      <QuizSelector 
        onStartQuiz={handleStartQuiz}
        lessonSlug={lessonSlug || undefined}
        lessonTitle={lesson?.title}
      />
    </div>
  );
}

export default function QuizPage() {
  return (
    <SearchParamsProvider>
      <QuizPageContent />
    </SearchParamsProvider>
  );
}



