'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PracticeHeader from "@/components/common/practice/PracticeHeader";
import PracticeSelector from "@/components/common/practice/PracticeSelector";
import { Practice } from '@/services/practices';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import { SearchParamsProvider } from '@/components/common/SearchParamsProvider';

export const dynamic = 'force-dynamic';

function PracticePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonSlug = searchParams.get('lesson');

  const { data: lessonsData, isLoading: isLoadingLesson } = useLessons({ 
    slug: lessonSlug || undefined,
    includePractices: true 
  });
  
  const lesson = lessonsData?.[0];

  const handleStartPractice = (practice: Practice) => {
    const params = new URLSearchParams();
    if (lessonSlug) params.set('lesson', lessonSlug);
    params.set('practice', practice.id);
    
    router.push(`/practice/session?${params.toString()}`);
  };

  return (
    <div className="">
      <main className="container mx-auto mt-10 px-4">
        <PracticeHeader 
          lessonTitle={lesson?.title}
          lessonDescription={lesson?.description}
        />

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
      </main>
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

