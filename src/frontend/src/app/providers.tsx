'use client';

import { QueryProvider } from '@/lib/react-query/query-provider';
import { AuthProvider } from '@/contexts';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}

