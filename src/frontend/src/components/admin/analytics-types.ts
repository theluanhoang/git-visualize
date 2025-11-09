import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface TabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  description?: string;
  progress?: number;
}

export interface ActivityItemProps {
  date: string;
  users: number;
  lessons: number;
  views: number;
}

export interface SegmentItemProps {
  segment?: string;
  device?: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface TopLessonItemProps {
  id: string | number;
  title: string;
  views: number;
  completionRate: number;
  rating: number;
  index: number;
}
