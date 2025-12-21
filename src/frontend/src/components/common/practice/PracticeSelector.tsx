'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { usePractices } from '@/lib/react-query/hooks/use-practices';
import { useSearchParams, useRouter } from 'next/navigation';
import { Practice } from '@/services/practices';
import PracticeDetails from './PracticeDetails';
import Pagination from '@/components/common/Pagination';
import { useTranslations } from 'next-intl';
import { getDifficultyColor } from '@/utils/practice';

interface PracticeSelectorProps {
  onStartPractice?: (practice: Practice) => void;
  lessonSlug?: string;
  lessonTitle?: string;
}

export default function PracticeSelector({ onStartPractice, lessonSlug, lessonTitle }: PracticeSelectorProps) {
  const t = useTranslations('practice');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 9; // Show more items in grid view

  const { data: practicesData, isLoading } = usePractices({ 
    includeRelations: true,
    lessonSlug: lessonSlug || undefined,
    difficulty: typeof difficultyFilter === 'number' ? difficultyFilter : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const practices = useMemo(() => (
    Array.isArray(practicesData) ? practicesData : (practicesData as { data: Practice[] })?.data || []
  ), [practicesData]);
  const totalItems = (practicesData as { total?: number })?.total ?? practices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayedPractices = useMemo(() => practices.filter((practice: Practice) =>
    practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.scenario.toLowerCase().includes(searchTerm.toLowerCase())
  ), [practices, searchTerm]);

  const handleSelectPractice = (practice: Practice) => {
    setSelectedPractice(practice);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedPractice(null);
    // Remove practice from URL if exists
    const params = new URLSearchParams(searchParams ? searchParams.toString() : undefined);
    params.delete('practice');
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    const selectedId = searchParams?.get('practice');
    if (!selectedId || selectedPractice?.id === selectedId) {
      return;
    }

    const found = practices.find((practice) => practice.id === selectedId);
    if (found) {
      setSelectedPractice(found);
    }
  }, [searchParams, practices, selectedPractice?.id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPractice) {
        handleCloseModal();
      }
    };

    if (selectedPractice) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [selectedPractice, handleCloseModal]);

  const handleStartPractice = useCallback((practiceOverride?: Practice) => {
    const practiceToStart = practiceOverride ?? selectedPractice;
    if (!practiceToStart || !onStartPractice) {
      console.warn('Cannot start practice: missing practice or onStartPractice handler');
      return;
    }
    // Close modal immediately
    handleCloseModal();
    // Start practice navigation - using window.location.href so it works reliably
    onStartPractice(practiceToStart);
  }, [selectedPractice, onStartPractice, handleCloseModal]);

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return t('beginner');
      case 2:
        return t('intermediate');
      case 3:
        return t('advanced');
      default:
        return t('details.difficultyUnknown');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (displayedPractices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-muted-foreground mb-2">
          {lessonSlug ? t('noPractices') : 'Không tìm thấy bài thực hành nào'}
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
            placeholder={t('selector.searchPlaceholder')}
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
            <SelectValue placeholder={t('selector.filterByDifficulty')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('selector.allDifficulties')}</SelectItem>
            <SelectItem value="1">{t('beginner')}</SelectItem>
            <SelectItem value="2">{t('intermediate')}</SelectItem>
            <SelectItem value="3">{t('advanced')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Practice Grid - Similar to quiz page */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedPractices.map((practice) => (
          <div
            key={practice.id}
            onClick={() => handleSelectPractice(practice)}
            className="block border rounded-md p-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg flex-1">{practice.title}</h3>
              <Badge 
                className={`ml-2 ${getDifficultyColor(practice.difficulty)}`}
                variant="secondary"
              >
                {getDifficultyLabel(practice.difficulty)}
              </Badge>
            </div>
            {practice.scenario && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                {practice.scenario}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{t('details.estimatedTimeLabel', { count: practice.estimatedTime })}</span>
              <span>{t('details.viewsCount', { count: practice.views })}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPractice(practice);
                }}
              >
                Chi tiết
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartPractice(practice);
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

      {/* Practice Details Modal - Show when practice is selected */}
      {selectedPractice && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0" 
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="practice-modal-title"
        >
          <div 
            className="bg-background rounded-xl border shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
              <h2 id="practice-modal-title" className="text-lg font-semibold text-foreground">
                Chi tiết bài thực hành
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={handleCloseModal}
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-4 md:p-6">
              <PracticeDetails
                practice={selectedPractice}
                onStartPractice={() => {
                  if (selectedPractice) {
                    handleStartPractice(selectedPractice);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
