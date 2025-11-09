'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = '/auth/login',
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.replace(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        router.replace('/')
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

export function useAuthGuard(requireAuth = true) {
  const { isAuthenticated, isLoading } = useAuth()
  
  return {
    canAccess: requireAuth ? isAuthenticated : !isAuthenticated,
    isLoading,
    isAuthenticated
  }
}
