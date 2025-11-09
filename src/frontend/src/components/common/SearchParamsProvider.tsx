import { Suspense, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SearchParamsProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

const DefaultFallback = ({ className }: { className?: string }) => (
  <div className={cn("container mx-auto mt-10 px-4", className)}>
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[var(--muted)] rounded w-1/3"></div>
      <div className="h-4 bg-[var(--muted)] rounded w-1/2"></div>
      <div className="h-64 bg-[var(--muted)] rounded"></div>
    </div>
  </div>
);

export function SearchParamsProvider({ 
  children, 
  fallback,
  className
}: SearchParamsProviderProps) {
  const defaultFallback = <DefaultFallback className={className} />;
  
  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      {children}
    </Suspense>
  );
}

