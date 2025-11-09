import { Card } from '@/components/ui/card';
import { MetricCardProps } from './analytics-types';

export function MetricCard({ title, value, icon: Icon, color = 'text-blue-600', description, progress }: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className={`text-3xl font-bold ${color} mb-2`}>
        {value}
      </div>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`${color.replace('text-', 'bg-')} h-2 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
    </Card>
  );
}
