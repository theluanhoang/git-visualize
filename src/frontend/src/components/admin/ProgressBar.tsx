import { Card } from '@/components/ui/card';
import { ProgressBarProps } from './analytics-types';

export function ProgressBar({ value, max = 100, color = 'bg-blue-600', showLabel = true, label }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label || `${value}`}</span>
          <span className="text-gray-900 font-medium">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
