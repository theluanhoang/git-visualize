'use client';

import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard, AdminTable, ActionButtons, StatusBadge, DateDisplay } from '@/components/admin';
import Link from 'next/link';
import { useDeleteLesson } from '@/lib/react-query/hooks/use-lessons';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts';
import AdminWelcomeBanner from '@/components/admin/AdminWelcomeBanner';
import { useDashboardStats, useRecentUsers, useRecentLessons } from '@/lib/react-query/hooks/use-analytics';

type TableColumn<T = Record<string, unknown>> = {
  key: keyof T | 'actions';
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
};

type LessonRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  lastModified: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  lastActive?: string;
  lastLoginAt?: string | Date | null;
  joinedAt: string;
};

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const router = useRouter();
  const deleteLessonMutation = useDeleteLesson();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch real data
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentUsers, isLoading: usersLoading } = useRecentUsers(3);
  const { data: recentLessonsData, isLoading: lessonsLoading } = useRecentLessons(10);


  const handleDeleteClick = (id: string | undefined) => {
    if (!id || typeof id !== 'string') {
      return;
    }
    openConfirmDelete(id);
  };

  const openConfirmDelete = (id: string) => {
    if (!id || id === 'NaN' || id === 'undefined' || id === 'null' || id.length < 8) {
      return;
    }
    setPendingDeleteId(id);
    setConfirmOpen(true);
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
    } catch (e) {
      console.error('Failed to delete lesson', e);
    }
  };
  const lessonColumns: TableColumn<LessonRow>[] = [
    { key: 'title', label: 'Tiêu đề', render: (value: unknown) => (
      <span className="block max-w-[280px] truncate" title={value as string}>{value as string}</span>
    ) },
    { key: 'status', label: 'Trạng thái', render: (value: unknown) => <StatusBadge status={value as 'draft' | 'published'} /> },
    { key: 'views', label: 'Lượt xem' },
    { key: 'lastModified', label: 'Cập nhật cuối', render: (value: unknown) => <DateDisplay date={value as string} /> },
    { 
      key: 'actions', 
      label: 'Thao tác', 
      render: (value: unknown, row: LessonRow) => (
        <ActionButtons 
          onView={() => {
            if (row.slug) window.open(`/git-theory/${row.slug}`, '_blank', 'noopener,noreferrer');
          }}
          onEdit={() => {
            if (row.slug) window.open(`/admin/lessons/${row.slug}/edit`, '_blank', 'noopener,noreferrer');
          }}
          onDelete={() => handleDeleteClick(row.id)}
        />
      )
    },
  ];

  const userColumns: TableColumn<UserRow>[] = [
    { key: 'name', label: 'Tên' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Vai trò', render: (value: unknown) => {
      const role = String(value || '').toUpperCase();
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
          role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {role === 'ADMIN' ? 'Admin' : role === 'INSTRUCTOR' ? 'Instructor' : 'Học viên'}
        </span>
      );
    }},
    { key: 'lastActive', label: 'Hoạt động cuối', render: (value: unknown, row: UserRow) => {
      const lastActive = row.lastActive || row.lastLoginAt || null;
      if (!lastActive) {
        return <span className="text-sm text-muted-foreground">Chưa có</span>;
      }
      return <DateDisplay date={lastActive as string} />;
    }},
    { 
      key: 'actions', 
      label: 'Thao tác', 
      render: (value: unknown, row: UserRow) => (
        <ActionButtons 
          onView={() => {
            if (row.email) router.push(`/admin/users?email=${encodeURIComponent(row.email)}&open=view`)
          }}
          onEdit={() => {
            if (row.email) router.push(`/admin/users?email=${encodeURIComponent(row.email)}&open=edit`)
          }}
        />
      )
    },
  ];

  return (
    <div className="space-y-6">
      <AdminWelcomeBanner userName={user?.firstName} />
      
      <PageHeader 
        title={`Chào mừng, ${user?.firstName || 'Admin'}! 👋`}
        description="Bảng điều khiển quản trị hệ thống Git Learning Platform"
        actions={
          <Link href="/admin/lessons/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm bài học mới
            </Button>
          </Link>
        }
      />

      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng bài học"
          value={statsLoading ? '...' : stats?.totalLessons || 0}
          icon={BookOpen}
          color="text-blue-500"
        />
        <StatCard
          title="Người dùng"
          value={statsLoading ? '...' : stats?.totalUsers || 0}
          icon={Users}
          color="text-green-500"
        />
        <StatCard
          title="Lượt xem"
          value={statsLoading ? '...' : stats?.totalViews || 0}
          icon={Eye}
          color="text-purple-500"
        />
        <StatCard
          title="Hoạt động gần đây"
          value={statsLoading ? '...' : stats?.recentActivity || 0}
          icon={TrendingUp}
          color="text-orange-500"
        />
      </div>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Bài học gần đây</h3>
            <Link href="/admin/lessons">
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <AdminTable<LessonRow> 
            columns={lessonColumns}
            data={lessonsLoading ? [] : recentLessonsData ?? []}
            emptyMessage={lessonsLoading ? "Đang tải..." : "Chưa có bài học nào"}
          />
        </Card>

        {}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Người dùng mới</h3>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
          <AdminTable<UserRow>
            columns={userColumns}
            data={usersLoading ? [] : (recentUsers?.users ?? [])}
            emptyMessage={usersLoading ? "Đang tải..." : "Chưa có người dùng nào"}
          />
        </Card>
      </div>

      {}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/lessons/new">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Plus className="h-6 w-6" />
              <span>Tạo bài học mới</span>
            </Button>
          </Link>
          <Link href="/admin/lessons">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Quản lý bài học</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              <span>Quản lý người dùng</span>
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Xem báo cáo</span>
            </Button>
          </Link>
        </div>
      </Card>
      <ConfirmDialog
        open={confirmOpen}
        title="Xóa bài học?"
        description="Hành động này sẽ xóa bài học khỏi hệ thống. Bạn có chắc chắn?"
        confirmText="Xóa"
        cancelText="Hủy"
        loading={deleteLessonMutation.isPending}
        onConfirm={performDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

