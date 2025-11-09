'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, Eye } from 'lucide-react';

interface GoalButtonProps {
  onClick: () => void;
  hasGoal: boolean;
  className?: string;
}

export function GoalButton({ onClick, hasGoal, className = '' }: GoalButtonProps) {
  if (!hasGoal) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <Target className="h-4 w-4" />
      <span>View Goal</span>
    </Button>
  );
}

