'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Eye, 
  BookOpen,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, AdminTable, ActionButtons, StatusBadge, DateDisplay, StatCard, FilterBar, EmptyState } from '@/components/admin';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useLessons, useDeleteLesson } from '@/lib/react-query/hooks/use-lessons';
import { useTranslations } from 'next-intl';

export default function LessonsPage() {
  const t = useTranslations('admin');
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const statusOptions = [
    { value: 'all', label: t('allStatuses') },
    { value: 'published', label: t('published') },
    { value: 'draft', label: t('draft') }
  ];

  const { data: lessons = [], isLoading } = useLessons();
  const deleteLessonMutation = useDeleteLesson();

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lesson.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const totalItems = filteredLessons.length;
  const pagedLessons = filteredLessons.slice((page - 1) * pageSize, page * pageSize);

  const openConfirmDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteClick = (id: string | undefined) => {
    if (!id) {
      return;
    }
    const idString = id.trim();
    if (!idString || idString === 'undefined' || idString === 'null' || idString === 'NaN' || idString.length < 8) {
      return;
    }
    openConfirmDelete(idString);
  };

  const performDelete = async () => {
    if (!pendingDeleteId || pendingDeleteId === 'NaN' || pendingDeleteId === 'undefined' || pendingDeleteId === 'null') {
      setConfirmOpen(false);
      setPendingDeleteId(null);
      return;
    }
    try {
      await deleteLessonMutation.mutateAsync(pendingDeleteId);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const lessonColumns = [
    { key: 'title', label: t('title') },
    { key: 'status', label: t('status'), render: (value: unknown) => <StatusBadge status={value as 'draft' | 'published'} /> },
    { 
      key: 'views', 
      label: t('views'), 
      render: (value: unknown, row: Record<string, unknown>) => {
        const viewsValue = row.views ?? value ?? 0;
        const views = typeof viewsValue === 'number' ? viewsValue : parseInt(String(viewsValue || 0), 10);
        return (
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground">{formatNumber(views)}</span>
          </div>
        );
      }
    },
    { key: 'author', label: t('author') },
    { key: 'updatedAt', label: t('lastModified'), render: (value: unknown) => <DateDisplay date={value as string} /> },
    { 
      key: 'actions', 
      label: t('actions'), 
      render: (value: unknown, row: Record<string, unknown>) => (
        <ActionButtons
          onView={async () => {
            try {
              const slug = row.slug;
              if (slug) {
                window.open(`/git-theory/${slug}`, '_blank', 'noopener,noreferrer');
                return;
              }
              console.warn('No slug available for this lesson row', row);
            } catch (e) {
              console.error('Failed to view lesson', e);
            }
          }}
          onEdit={() => {
            if (row.slug) {
              window.open(`/admin/lessons/${row.slug}/edit`, '_blank', 'noopener,noreferrer');
            } else {
              console.warn('No slug available to edit', row);
            }
          }}
          onDelete={() => handleDeleteClick(row.id as string | undefined)}
        />
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('manageLessons')}
        description={t('manageLessonsDescription')}
        actions={
          <Link href={`/${locale}/admin/lessons/new`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('createNew')}
            </Button>
          </Link>
        }
      />

      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('totalLessons')}
          value={lessons.length}
          icon={BookOpen}
          color="text-blue-500"
        />
        <StatCard
          title={t('published')}
          value={lessons.filter(l => l.status === 'published').length}
          icon={Eye}
          color="text-green-500"
        />
        <StatCard
          title={t('totalViews')}
          value={formatNumber(lessons.reduce((sum, lesson) => sum + (lesson.views || 0), 0))}
          icon={TrendingUp}
          color="text-purple-500"
        />
        <StatCard
          title={t('draft')}
          value={lessons.filter(l => l.status === 'draft').length}
          icon={Calendar}
          color="text-orange-500"
        />
      </div>

      {}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('searchLessons')}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={statusOptions}
        showSortButton={true}
        onSortClick={() => {}}
      />

      {}
      <AdminTable 
        columns={lessonColumns}
        data={pagedLessons}
        emptyMessage={t('noLessons')}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems,
          onPageChange: setPage,
          showInfo: true,
        }}
        onRowClick={async (lesson) => {
          try {
            if (lesson.slug) {
              window.open(`/git-theory/${lesson.slug}`, '_blank', 'noopener,noreferrer');
              return;
            }
            console.warn('No slug available for this lesson row', lesson);
          } catch (e) {
            console.error('Failed to navigate to lesson', e);
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('deleteLesson')}
        description={t('deleteLessonConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        loading={deleteLessonMutation.isPending}
        onConfirm={performDelete}
        onClose={() => setConfirmOpen(false)}
      />

      {}
      {filteredLessons.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={t('noLessonsFound')}
          description={
            searchTerm || statusFilter !== 'all' 
              ? t('tryDifferentFilters')
              : t('startCreatingFirstLesson')
          }
          actionLabel={t('addNewLesson')}
          actionIcon={Plus}
          onAction={() => router.push(`/${locale}/admin/lessons/new`)}
        />
      )}
    </div>
  );
}
