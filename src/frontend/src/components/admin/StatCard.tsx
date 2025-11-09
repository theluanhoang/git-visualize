import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatCardProps } from './types';

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-blue-500', 
  change, 
  trend, 
  description 
}: StatCardProps) {
  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <Icon className={`h-8 w-8 ${color}`} />
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-semibold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <div className="flex items-center ml-2">
                {getTrendIcon(trend.value)}
                <span className={`text-sm font-medium ${getTrendColor(trend.value)}`}>
                  {trend.value}%{trend.label && ` ${trend.label}`}
                </span>
              </div>
            )}
          </div>
          {change && (
            <p className={`text-sm ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change.type === 'increase' ? '↗' : '↘'} {change.value}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
