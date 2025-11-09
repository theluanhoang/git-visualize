import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Mail,
  UserCheck,
  UserX,
  Trash2
} from 'lucide-react';

import type { User } from '@/types/user';

export interface UserCardProps {
  user: User;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onSendEmail?: (user: User) => void;
}

export function UserCard({ 
  user, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSendEmail 
}: UserCardProps) {
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
  const getRoleBadge = (role: string) => {
    const styles = {
      student: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      instructor: 'bg-green-500/10 text-green-600 dark:text-green-400',
      admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    };
    
    const labels = {
      student: 'Học viên',
      instructor: 'Giảng viên',
      admin: 'Quản trị viên'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/10 text-green-600 dark:text-green-400',
      inactive: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      banned: 'bg-red-500/10 text-red-600 dark:text-red-400'
    };
    
    const labels = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      banned: 'Bị cấm'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
            </div>
            <p className="text-muted-foreground mb-3">{user.email}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Tham gia: {formatDateTime(user.joinedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>Hoạt động cuối: {formatDateTime(user.lastActive)}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{user.lessonsCompleted} bài học</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>Tiến độ: {user.progress}%</span>
              </div>
            </div>
            
            {}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span>Tiến độ học tập</span>
                <span>{user.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${user.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="sm" onClick={() => onView?.(user)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(user)}>
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(user)}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendEmail?.(user)}>
                <Mail className="h-4 w-4 mr-2" />
                Gửi email
              </DropdownMenuItem>
              {user.status === 'active' ? (
                <DropdownMenuItem 
                  className="text-yellow-600"
                  onClick={() => onToggleStatus?.(user)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Vô hiệu hóa
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  className="text-green-600"
                  onClick={() => onToggleStatus?.(user)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Kích hoạt
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete?.(user)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
