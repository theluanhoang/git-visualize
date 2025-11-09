import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'published' | 'draft';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    published: { label: 'Xuất bản', variant: 'default' as const },
    draft: { label: 'Bản nháp', variant: 'secondary' as const },
  } as const;

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

interface DateDisplayProps {
  date: string | Date | null | undefined;
  showIcon?: boolean;
}

export function DateDisplay({ date, showIcon = false }: DateDisplayProps) {
  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return 'N/A';
    const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!date) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {showIcon && <Calendar className="h-4 w-4" />}
        <span>Chưa có</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {showIcon && <Calendar className="h-4 w-4" />}
      <span>{formatDate(date)}</span>
    </div>
  );
}

interface TimeDisplayProps {
  time: string;
  showIcon?: boolean;
}

export function TimeDisplay({ time, showIcon = false }: TimeDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {showIcon && <Clock className="h-4 w-4" />}
      <span>{time}</span>
    </div>
  );
}
