'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminUserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | string;
    status: 'active' | 'inactive' | string;
    joinedAt?: string;
    avatar?: string | null;
    totalSessions?: number;
    activeSessions?: number;
    oauthSessions?: number;
    lastLoginAt?: string | Date | null;
  } | null;
}

export default function AdminUserDetailsDialog({ open, onClose, user }: AdminUserDetailsDialogProps) {
  if (!user) return null;

  const formatDateTime = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    const dd = pad(d.getDate());
    const mo = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    return `${hh}:${mm}:${ss} ${dd}/${mo}/${yyyy}`;
  };

  const role = String(user.role || '').toUpperCase();
  const roleBadge = (
    <Badge className={
      role === 'ADMIN'
        ? 'bg-purple-600 text-white'
        : 'bg-gray-600 text-white'
    }>
      {role === 'ADMIN' ? 'Admin' : 'Học viên'}
    </Badge>
  );

  const status = String(user.status || '').toLowerCase();
  const statusBadge = (
    <Badge className={
      status === 'active'
        ? 'bg-green-600 text-white'
        : 'bg-yellow-600 text-white'
    }>
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
              {user.name?.slice(0, 1).toUpperCase() || user.email?.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-semibold truncate max-w-[240px]">{user.name || user.email}</p>
                {roleBadge}
                {statusBadge}
              </div>
              <p className="text-sm text-muted-foreground truncate max-w-[300px]">{user.email}</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">User ID</p>
              <p className="font-medium break-all">{String(user.id)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Tham gia</p>
              <p className="font-medium">{formatDateTime(user.joinedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Phiên đang hoạt động</p>
              <p className="font-medium">{user.activeSessions ?? 0} / {user.totalSessions ?? 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Phiên OAuth</p>
              <p className="font-medium">{user.oauthSessions ?? 0}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-muted-foreground">Đăng nhập gần nhất</p>
              <p className="font-medium">{user.lastLoginAt ? formatDateTime(typeof user.lastLoginAt === 'string' ? user.lastLoginAt : (user.lastLoginAt as Date).toString()) : '-'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


