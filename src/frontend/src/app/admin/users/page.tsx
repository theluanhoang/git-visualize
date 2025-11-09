'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  UserCheck,
  BookOpen,
  TrendingUp,
  Shield
} from 'lucide-react';
import { PageHeader, StatCard, FilterBar, EmptyState, UserList } from '@/components/admin';
import AdminUserDetailsDialog from '@/components/admin/AdminUserDetailsDialog';
import AdminUserEditDialog from '@/components/admin/AdminUserEditDialog';
import AdminUserEmailDialog from '@/components/admin/AdminUserEmailDialog';
import { useUsers as useUsersQuery, useDeleteUser, useUpdateUserStatus, useSendUserEmail } from '@/lib/react-query/hooks/use-analytics';
import type { User, UserStatus } from '@/types/user';
import { SearchParamsProvider } from '@/components/common';

const roleOptions = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'USER', label: 'Người dùng' },
  { value: 'ADMIN', label: 'Quản trị viên' }
];

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'banned', label: 'Bị cấm' }
];

function UsersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [emailUser, setEmailUser] = useState<User | null>(null);

  const { data, isLoading } = useUsersQuery({
    page: 1,
    limit: 50,
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy,
    sortOrder: 'DESC'
  });
  const users: User[] = (
    (data?.users) ?? []
  ).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status as UserStatus,
    joinedAt: u.joinedAt,
    lastActive: u.lastActive ?? (u.joinedAt || ''),
    lessonsCompleted: u.lessonsCompleted ?? 0,
    totalTimeSpent: u.totalTimeSpent ?? '-',
    progress: u.progress ?? 0,
    achievements: u.achievements ?? 0,
    totalSessions: u.totalSessions,
    activeSessions: u.activeSessions,
    oauthSessions: u.oauthSessions,
    lastLoginAt: u.lastLoginAt ?? null,
  }));

  const filteredUsers = users; 

  const deepLinkHandledRef = useRef(false);
  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    const emailParam = searchParams.get('email');
    const openParam = searchParams.get('open');
    if (!emailParam) return;

    const target = users.find(u => u.email === emailParam);
    if (!target) return;

    if (openParam === 'view') setViewUser(target);
    if (openParam === 'edit') setEditUser(target);

    router.replace('/admin/users');
    deepLinkHandledRef.current = true;
  }, [searchParams, users, router]);

  const deleteUserMutation = useDeleteUser();
  const toggleUserStatusMutation = useUpdateUserStatus();
  const sendUserEmailMutation = useSendUserEmail();

  const handleDeleteUser = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await deleteUserMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await toggleUserStatusMutation.mutateAsync({ userId: user.id, isActive: newStatus === 'active' });
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý người dùng"
        description="Quản lý tất cả người dùng trong hệ thống"
      />

      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tổng người dùng"
        value={users.length}
          icon={UserCheck}
          color="text-blue-500"
        />
        <StatCard
          title="Hoạt động"
          value={users.filter(u => u.status === 'active').length}
          icon={TrendingUp}
          color="text-green-500"
        />
      <StatCard
        title="Người dùng"
        value={users.filter(u => u.role === 'USER').length}
        icon={BookOpen}
        color="text-purple-500"
      />
      <StatCard
        title="Quản trị viên"
        value={users.filter(u => u.role === 'ADMIN').length}
        icon={Shield}
        color="text-orange-500"
      />
      </div>

      {}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm người dùng..."
        filters={[
          {
            id: 'role',
            label: 'Lọc theo vai trò',
            value: roleFilter,
            onChange: setRoleFilter,
            options: roleOptions
          },
          {
            id: 'status',
            label: 'Lọc theo trạng thái',
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions
          }
        ]}
        showSortButton={true}
        onSortClick={() => {}}
      />

      {}
      <UserList
        users={filteredUsers}
        onView={(user) => setViewUser(user)}
        onEdit={(user) => setEditUser(user)}
        onDelete={(user) => handleDeleteUser(user.id)}
        onToggleStatus={handleToggleUserStatus}
        onSendEmail={(user) => setEmailUser(user)}
      />

      {}
      {filteredUsers.length === 0 && (
        <EmptyState
          icon={UserCheck}
          title="Không tìm thấy người dùng"
          description={
            searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Chưa có người dùng nào trong hệ thống'
          }
        />
      )}

      <AdminUserDetailsDialog
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        user={viewUser}
      />

      <AdminUserEditDialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
        onSaveStatus={async (userId, isActive) => {
          await toggleUserStatusMutation.mutateAsync({ userId, isActive });
        }}
      />

      <AdminUserEmailDialog
        open={!!emailUser}
        onClose={() => setEmailUser(null)}
        user={emailUser}
        onSend={async ({ userId, subject, message, attachments }) => {
          await sendUserEmailMutation.mutateAsync({
            userId,
            subject,
            message,
            attachments,
            onProgress: (percent) => {
              // TODO: optionally show global toast/progress
              // console.log('upload', percent);
            },
          });
        }}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <SearchParamsProvider>
      <UsersPageContent />
    </SearchParamsProvider>
  );
}

