import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { TopLessonItemProps } from './analytics-types';

export function TopLessonItem({ id, title, views, completionRate, rating, index }: TopLessonItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary">#{index + 1}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {views} lượt xem
            </span>
            {completionRate > 0 && (
              <span>{completionRate}% hoàn thành</span>
            )}
            {rating > 0 && (
              <span>⭐ {rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
      {completionRate > 0 && (
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-sm font-medium text-foreground">{completionRate}%</span>
        </div>
      )}
    </div>
  );
}

export function TopLessonsCard({ lessons }: { lessons: Omit<TopLessonItemProps, 'index'>[] }) {
  if (!lessons || lessons.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Bài học phổ biến</h3>
        <div className="text-center text-muted-foreground py-8">
          Chưa có dữ liệu bài học
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Bài học phổ biến</h3>
        <Button variant="outline" size="sm">Xem tất cả</Button>
      </div>
      <div className="space-y-3">
        {lessons.map((lesson, index) => (
          <TopLessonItem key={lesson.id} {...lesson} index={index} />
        ))}
      </div>
    </Card>
  );
}
