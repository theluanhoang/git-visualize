import { Card } from '@/components/ui/card';
import { ActivityItemProps } from './analytics-types';

export function ActivityItem({ date, users, lessons, views }: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground mb-1">{date}</div>
        <div className="text-xs text-muted-foreground">{users} người dùng</div>
      </div>
      <div className="flex items-center gap-4 text-sm text-foreground/80 flex-shrink-0 ml-4">
        <span className="whitespace-nowrap">{lessons} bài học</span>
        <span className="whitespace-nowrap">{views} lượt xem</span>
      </div>
    </div>
  );
}

export function ActivityTimeline({ activities }: { activities: ActivityItemProps[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Hoạt động hàng ngày</h3>
      {activities.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Chưa có dữ liệu hoạt động
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </div>
      )}
    </Card>
  );
}
