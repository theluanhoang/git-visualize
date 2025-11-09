'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import { usePractice } from '@/lib/react-query/hooks/use-practice';
import PracticeSession from "@/components/common/practice/PracticeSession";
import PracticeHeader from "@/components/common/practice/PracticeHeader";
import { GoalModal } from "@/components/common/practice/GoalModal";
import { GoalButton } from "@/components/common/practice/GoalButton";
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useTranslations } from 'next-intl';
import { SearchParamsProvider } from '@/components/common';

function PracticeSessionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const lessonSlug = searchParams.get('lesson');
  const practiceId = searchParams.get('practice');
  const t = useTranslations('practice.session');
  
  const [showGoalModal, setShowGoalModal] = useState(false);

  const { data: lessonsData } = useLessons({ 
    slug: lessonSlug || undefined,
    includePractices: false 
  });
  
  const { 
    data: selectedPractice, 
    isLoading, 
    error 
  } = usePractice(practiceId || '', {
    enabled: !!practiceId
  });
  
  const lesson = lessonsData?.[0];

  const handleCompletePractice = () => {
    router.push(`/${locale}/practice?lesson=${lessonSlug}`);
  };

  const handleExitPractice = () => {
    router.push(`/${locale}/practice?lesson=${lessonSlug}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingSession')}</p>
        </div>
      </div>
    );
  }

  if (error || !selectedPractice) {
    return (
      <div className="container mx-auto mt-10 px-4">
        <PracticeHeader 
          lessonTitle={lesson?.title}
          lessonDescription={lesson?.description}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error?.message || t('sessionNotFound')}</p>
            <button
              onClick={() => router.push(`/practice?lesson=${lessonSlug}`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {t('exitPractice')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute showAccessDenied={false}>
      <div className="">
        <main className="container mx-auto mt-10 px-4">
        <PracticeHeader 
          lessonTitle={lesson?.title}
          lessonDescription={lesson?.description}
        />
        
        {}
        <PracticeSession
          practice={selectedPractice}
          onComplete={handleCompletePractice}
          onExit={handleExitPractice}
        />

        {}
        {selectedPractice?.goalRepositoryState && (
          <GoalModal
            isOpen={showGoalModal}
            onClose={() => setShowGoalModal(false)}
            goalRepositoryState={selectedPractice.goalRepositoryState}
            practiceTitle={selectedPractice.title}
          />
        )}
        </main>
      </div>
    </PrivateRoute>
  );
}

export default function PracticeSessionPage() {
  return (
    <SearchParamsProvider>
      <PracticeSessionPageContent />
    </SearchParamsProvider>
  );
}

