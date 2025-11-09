import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface QuickAction {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    showInfo?: boolean;
  };
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}
