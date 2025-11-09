'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Users, TrendingUp } from 'lucide-react';
import { useLessonViewStats } from '@/lib/react-query/hooks/use-lessons';

interface LessonViewStatsProps {
  lessonId: string;
  className?: string;
}

export default function LessonViewStats({ lessonId, className }: LessonViewStatsProps) {
  const { data: stats, isLoading, error } = useLessonViewStats(lessonId);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tổng lượt xem</div>
              <div className="text-lg font-semibold">{formatNumber(stats.totalViews)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Người xem</div>
              <div className="text-lg font-semibold">{formatNumber(stats.uniqueViewers)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">TB lượt xem/người</div>
              <div className="text-lg font-semibold">{stats.averageViewsPerUser.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

