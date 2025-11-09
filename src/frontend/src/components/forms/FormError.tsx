'use client';

import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  return (
    <Card className={`p-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 ${className}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      </div>
    </Card>
  );
}
