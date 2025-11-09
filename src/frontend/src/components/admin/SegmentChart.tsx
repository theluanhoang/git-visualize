import { Card } from '@/components/ui/card';
import { SegmentItemProps } from './analytics-types';
import { ProgressBar } from './ProgressBar';

export function SegmentItem({ segment, device, count, percentage, color = 'bg-blue-600' }: SegmentItemProps) {
  const label = segment || device || '';
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-24">
          <ProgressBar 
            value={percentage} 
            color={color}
            showLabel={false}
          />
        </div>
        <span className="text-sm font-medium text-foreground w-12 text-right">
          {count}
        </span>
      </div>
    </div>
  );
}

export function SegmentChart({ segments, title, color = 'bg-blue-600' }: { 
  segments: SegmentItemProps[], 
  title: string, 
  color?: string 
}) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {segments.map((segment, index) => (
          <SegmentItem key={index} {...segment} color={color} />
        ))}
      </div>
    </Card>
  );
}
