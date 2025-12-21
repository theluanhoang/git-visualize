'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useQuizzes } from '@/lib/react-query/hooks/use-quizzes';
import { useSearchParams, useRouter } from 'next/navigation';
import { Quiz } from '@/services/quizzes';
import QuizDetails from './QuizDetails';
import Pagination from '@/components/common/Pagination';

interface QuizSelectorProps {
  onStartQuiz?: (quiz: Quiz) => void;
  lessonSlug?: string;
  lessonTitle?: string;
}

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'bg-green-100 text-green-800 border-green-300';
    case 2:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 3:
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 4:
    case 5:
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Intermediate';
    case 3:
      return 'Advanced';
    case 4:
    case 5:
      return 'Expert';
    default:
      return 'Unknown';
  }
};

export default function QuizSelector({ onStartQuiz, lessonSlug, lessonTitle }: QuizSelectorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 9; // Show more items in grid view

  const { data: quizzesData, isLoading } = useQuizzes({ 
    includeRelations: true,
    lessonSlug: lessonSlug || undefined,
    difficulty: typeof difficultyFilter === 'number' ? difficultyFilter : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const quizzes = useMemo(() => (
    Array.isArray(quizzesData) ? quizzesData : (quizzesData as { data: Quiz[] })?.data || []
  ), [quizzesData]);
  const totalItems = (quizzesData as { total?: number })?.total ?? quizzes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayedQuizzes = useMemo(() => quizzes.filter((quiz: Quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ), [quizzes, searchTerm]);

  useEffect(() => {
    const selectedId = searchParams?.get('quiz');
    if (!selectedId || selectedQuiz?.id === selectedId) {
      return;
    }

    const found = quizzes.find((quiz) => quiz.id === selectedId);
    if (found) {
      setSelectedQuiz(found);
    }
  }, [searchParams, selectedQuiz?.id]); // Removed quizzes from dependencies - use selectedId from searchParams instead

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : undefined);
    params.set('quiz', quiz.id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleStartQuiz = (quizOverride?: Quiz) => {
    const quizToStart = quizOverride ?? selectedQuiz;
    if (!quizToStart || !onStartQuiz) {
      return;
    }
    onStartQuiz(quizToStart);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (displayedQuizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-muted-foreground mb-2">
          {lessonSlug ? 'Không có quiz nào cho bài học này' : 'Không tìm thấy quiz nào'}
        </p>
        <p className="text-sm text-muted-foreground">
          {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy chọn một bài học khác'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm quiz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={difficultyFilter === 'all' ? 'all' : difficultyFilter.toString()}
          onValueChange={(value) => setDifficultyFilter(value === 'all' ? 'all' : parseInt(value))}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="1">Beginner</SelectItem>
            <SelectItem value="2">Intermediate</SelectItem>
            <SelectItem value="3">Advanced</SelectItem>
            <SelectItem value="4">Expert</SelectItem>
            <SelectItem value="5">Master</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quiz Grid - Similar to git-theory page */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            onClick={() => handleSelectQuiz(quiz)}
            className="block border rounded-md p-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg flex-1">{quiz.title}</h3>
              <Badge 
                className={`ml-2 ${getDifficultyColor(quiz.difficulty)}`}
                variant="secondary"
              >
                {getDifficultyLabel(quiz.difficulty)}
              </Badge>
            </div>
            {quiz.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                {quiz.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{quiz.questions?.length || 0} câu hỏi</span>
              <span>{quiz.estimatedTime} phút</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectQuiz(quiz);
                }}
              >
                Chi tiết
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartQuiz(quiz);
                }}
              >
                Bắt đầu
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Quiz Details Modal/Sidebar - Show when quiz is selected */}
      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedQuiz(null)}>
          <div className="bg-background rounded-lg border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <QuizDetails
              quiz={selectedQuiz}
              onStartQuiz={() => {
                handleStartQuiz();
                setSelectedQuiz(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}



