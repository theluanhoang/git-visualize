import { Card } from '@/components/ui/card';
import { Award, Zap, Target } from 'lucide-react';

interface AchievementItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  color: string;
}

export function AchievementItem({ icon: Icon, title, count, color }: AchievementItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${color} mr-2`} />
        <span className="text-sm text-foreground">{title}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{count}</span>
    </div>
  );
}

export function AchievementsCard() {
  const achievements = [
    { icon: Award, title: 'Học viên xuất sắc', count: 23, color: 'text-yellow-500' },
    { icon: Zap, title: 'Hoàn thành nhanh', count: 45, color: 'text-blue-500' },
    { icon: Target, title: 'Mục tiêu đạt được', count: 156, color: 'text-green-500' },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Thành tích</h3>
      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <AchievementItem key={index} {...achievement} />
        ))}
      </div>
    </Card>
  );
}
