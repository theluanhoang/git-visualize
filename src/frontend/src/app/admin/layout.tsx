'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminSidebar, AdminTopBar } from '@/components/admin';
import { PrivateRoute } from '@/components/auth/PrivateRoute';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <PrivateRoute requireAuth={true} requireRole="ADMIN" showAccessDenied={false}>
      <div className="min-h-screen bg-background">
        <AdminSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <div className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}>
          <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />

          <main className="py-4 sm:py-6">
            <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}