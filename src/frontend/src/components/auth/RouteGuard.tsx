'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts';
import { PrivateRoute } from './PrivateRoute';

interface RouteGuardProps {
  children: React.ReactNode;
}

const ROUTE_CONFIG = {
  public: [
    '/',
    '/git-theory',
    '/practice',
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/celebration-demo'
  ],
  
  protected: [
    '/profile',
    '/practice/session'
  ],
  
  admin: [
    '/admin'
  ]
};

export function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{children}</>;
  }

  const isPublicRoute = ROUTE_CONFIG.public.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  const isProtectedRoute = ROUTE_CONFIG.protected.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  const isAdminRoute = ROUTE_CONFIG.admin.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isAdminRoute) {
    return (
      <PrivateRoute requireAuth={true} requireRole="ADMIN" showAccessDenied={false}>
        {children}
      </PrivateRoute>
    );
  }

  if (isProtectedRoute) {
    return (
      <PrivateRoute requireAuth={true} showAccessDenied={false}>
        {children}
      </PrivateRoute>
    );
  }

  if (pathname.startsWith('/auth/') && isAuthenticated) {
    return (
      <PrivateRoute requireAuth={false} showAccessDenied={false}>
        {children}
      </PrivateRoute>
    );
  }

  return <>{children}</>;
}

export function useRouteProtection() {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();

  const routeInfo = React.useMemo(() => {
    const isPublic = ROUTE_CONFIG.public.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    const isProtected = ROUTE_CONFIG.protected.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    const isAdmin = ROUTE_CONFIG.admin.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    return {
      isPublic,
      isProtected,
      isAdmin,
      requiresAuth: isProtected || isAdmin,
      requiresAdmin: isAdmin,
      canAccess: isPublic || (isProtected && isAuthenticated) || (isAdmin && user?.role === 'ADMIN')
    };
  }, [pathname, isAuthenticated, user]);

  return {
    ...routeInfo,
    isLoading,
    isAuthenticated,
    user
  };
}
