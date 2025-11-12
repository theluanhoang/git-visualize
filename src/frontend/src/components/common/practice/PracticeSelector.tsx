'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List } from 'lucide-react';
import { usePractices } from '@/lib/react-query/hooks/use-practices';
import { useSearchParams, useRouter } from 'next/navigation';
import { Practice } from '@/services/practices';
import PracticeList from './PracticeList';
import PracticeDetails from './PracticeDetails';
import Pagination from '@/components/common/Pagination';
import { useTranslations } from 'next-intl';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [page, setPage] = useState(1);
  const pageSize = 3;

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
  const displayedPractices = practices.filter((practice: Practice) =>
    practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practice.scenario.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSelectPractice = (practice: Practice) => {
    setSelectedPractice(practice);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : undefined);
    params.set('practice', practice.id);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleStartPractice = (practiceOverride?: Practice) => {
    const practiceToStart = practiceOverride ?? selectedPractice;
    if (!practiceToStart || !onStartPractice) {
      return;
    }
    onStartPractice(practiceToStart);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              {lessonTitle ? t('selector.titleWithLesson', { lesson: lessonTitle }) : t('selector.title')}
            </CardTitle>
            <CardDescription>
              {lessonSlug 
                ? t('selector.subtitleWithLesson')
                : t('selector.subtitle')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('selector.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {}
              <Select value={difficultyFilter.toString()} onValueChange={(value) => 
                setDifficultyFilter(value === 'all' ? 'all' : parseInt(value))
              }>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('selector.filterByDifficulty')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('selector.allDifficulties')}</SelectItem>
                  <SelectItem value="1">{t('beginner')}</SelectItem>
                  <SelectItem value="2">{t('intermediate')}</SelectItem>
                  <SelectItem value="3">{t('advanced')}</SelectItem>
                </SelectContent>
              </Select>

              {}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('selector.availablePractices')}</span>
                <Badge variant="secondary">
                  {t('selector.totalPractices', { count: totalItems })}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayedPractices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('selector.emptyMessage')}</p>
                </div>
              ) : (
                <PracticeList
                  practices={displayedPractices}
                  onSelectPractice={handleSelectPractice}
                  onStartPractice={handleStartPractice}
                  selectedPracticeId={selectedPractice?.id}
                />
              )}

              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  itemsPerPage={pageSize}
                  totalItems={totalItems}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {selectedPractice ? (
            <PracticeDetails
              practice={selectedPractice}
              onStartPractice={() => handleStartPractice(selectedPractice)}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('selector.selectPracticePrompt')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
