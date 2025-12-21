'use client';

import React from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PracticeSelector from "@/components/common/practice/PracticeSelector";
import { Practice } from '@/services/practices';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import { useTranslations } from 'next-intl';
import { SearchParamsProvider } from '@/components/common/SearchParamsProvider';

export const dynamic = 'force-dynamic';

function PracticePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('practice');
  const lessonSlug = searchParams.get('lesson');

  // Get all lessons to find the first one
  const { data: allLessonsData, isLoading: isLoadingAllLessons } = useLessons({
    limit: 100,
    offset: 0,
    status: 'published',
    includePractices: true
  });

  // Get selected lesson details
  const { data: lessonsData, isLoading: isLoadingLesson } = useLessons({ 
    slug: lessonSlug || undefined,
    includePractices: true 
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
        router.replace(`/${locale}/practice?lesson=${first.slug}`);
      }
    }
  }, [allLessonsData, isLoadingAllLessons, lessonSlug, router, locale]);

  const handleStartPractice = (practice: Practice) => {
    const params = new URLSearchParams();
    if (lessonSlug) params.set('lesson', lessonSlug);
    params.set('practice', practice.id);
    
    const url = `/${locale}/practice/session?${params.toString()}`;
    // Use window.location for reliable navigation
    window.location.href = url;
  };

  return (
    <div className="p-4">
      {lessonSlug && lesson && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
          {lesson.description && (
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PracticeSelector 
          onStartPractice={handleStartPractice}
          lessonSlug={lessonSlug || undefined}
          lessonTitle={lesson?.title}
        />
      </motion.div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <SearchParamsProvider>
      <PracticePageContent />
    </SearchParamsProvider>
  );
}

