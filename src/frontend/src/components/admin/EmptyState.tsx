import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
