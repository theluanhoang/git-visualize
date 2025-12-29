'use client';

import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useQuiz } from '@/lib/react-query/hooks/use-quizzes';
import QuizSession from "@/components/common/quiz/QuizSession";
import { SearchParamsProvider } from '@/components/common/SearchParamsProvider';

function QuizSessionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const lessonSlug = searchParams.get('lesson');
  const quizId = searchParams.get('quiz');
  
  const { 
    data: selectedQuiz, 
    isLoading, 
    error 
  } = useQuiz(quizId || '', {
    enabled: !!quizId
  });

  const handleCompleteQuiz = (score: number, passed: boolean) => {
    // Quiz completed, can navigate or show message
    console.log('Quiz completed:', { score, passed });
  };

  const handleExitQuiz = () => {
    if (lessonSlug) {
      router.push(`/${locale}/quiz?lesson=${lessonSlug}`);
    } else {
      router.push(`/${locale}/quiz`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedQuiz) {
    return (
      <div className="container mx-auto mt-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error?.message || 'Không tìm thấy quiz'}
            </p>
            <button
              onClick={() => {
                if (lessonSlug) {
                  router.push(`/${locale}/quiz?lesson=${lessonSlug}`);
                } else {
                  router.push(`/${locale}/quiz`);
                }
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <main className="container mx-auto mt-10 px-4 min-h-[calc(100vh-8rem)]">
        <QuizSession
          quiz={selectedQuiz}
          onComplete={handleCompleteQuiz}
          onExit={handleExitQuiz}
        />
      </main>
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <SearchParamsProvider>
      <QuizSessionPageContent />
    </SearchParamsProvider>
  );
}











