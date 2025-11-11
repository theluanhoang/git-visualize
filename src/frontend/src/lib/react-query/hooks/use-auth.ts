import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { authKeys } from '@/lib/react-query/query-keys'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api, { clearAuthState, tokenUtils } from '@/lib/api/axios'
import { authApi, authStorage, AuthUser } from '@/services/auth'
import { getLocaleFromPath } from '@/lib/middleware/utils'

export const useCurrentUser = () => {
  const queryClient = useQueryClient()
  const stored = authStorage.load()
  
  const hasAccessToken = !!stored.tokens?.accessToken
  const hasRefreshToken = !!stored.tokens?.refreshToken
  const isAccessTokenExpired = hasAccessToken ? tokenUtils.isTokenExpired(stored.tokens!.accessToken) : true
  const isRefreshTokenExpired = hasRefreshToken ? tokenUtils.isTokenExpired(stored.tokens!.refreshToken) : true
  
  const shouldEnableQuery = hasAccessToken && hasRefreshToken && (!isAccessTokenExpired || !isRefreshTokenExpired)
  
  const query = useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    enabled: shouldEnableQuery,
    staleTime: 0,
    gcTime: 0,
    retry: (failureCount, error: unknown) => {
      if ((error as { response?: { status?: number } })?.response?.status === 401) return false
      return failureCount < 2
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useEffect(() => {
    const handleAuthLogout = () => {
      queryClient.setQueryData(authKeys.user(), null)
      queryClient.removeQueries({ queryKey: authKeys.all, exact: false })
    }

    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [queryClient])

  return query
};

export const useLogin = () => {
  const qc = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password),
    onSuccess: ({ user, accessToken, refreshToken }) => {
      authStorage.save({ accessToken, refreshToken }, user as AuthUser)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      qc.setQueryData(authKeys.user(), user)
      qc.invalidateQueries({ queryKey: authKeys.all })
      
      if (user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    },
    onError: (error: unknown) => {
      console.error('Login failed:', error)
    }
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.register(email, password),
    onError: (error: unknown) => {
      console.error('Registration failed:', error)
    }
  })
}

export const useLogout = () => {
  const qc = useQueryClient()
  const router = useRouter()
  const params = useParams()
  
  const getCurrentLocale = (): string => {
    if (params?.locale && typeof params.locale === 'string') {
      return params.locale
    }
    
    if (typeof window !== 'undefined') {
      const locale = getLocaleFromPath(window.location.pathname)
      return locale || 'vi'
    }
    
    return 'vi'
  }
  
  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout?.()
      } catch (error) {
        console.warn('Logout API call failed:', error)
      }
    },
    onSuccess: () => {
      const locale = getCurrentLocale()
      
      authStorage.clear()
      clearAuthState()
      qc.setQueryData(authKeys.user(), null)
      qc.removeQueries({ queryKey: authKeys.all, exact: false })
      qc.clear()
      
      router.replace(`/${locale}/auth/login`)
    },
    onError: () => {
      const locale = getCurrentLocale()
      
      authStorage.clear()
      clearAuthState()
      qc.setQueryData(authKeys.user(), null)
      qc.removeQueries({ queryKey: authKeys.all, exact: false })
      
      router.replace(`/${locale}/auth/login`)
    }
  })
}

export const useUpdateProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Pick<AuthUser, 'firstName'|'lastName'|'avatar'>>) => authApi.updateCurrentUser(payload),
    onSuccess: (user) => {
      qc.setQueryData(authKeys.user(), user)
      const stored = authStorage.load()
      if (stored.tokens) {
        authStorage.save(stored.tokens, user)
      }
    },
    onError: (error: unknown) => {
      console.error('Profile update failed:', error)
    }
  })
}

export const useIsAuthenticated = () => {
  const { data: user, isLoading, error } = useCurrentUser()
  const stored = authStorage.load()
  
  const hasAccessToken = !!stored.tokens?.accessToken
  const hasRefreshToken = !!stored.tokens?.refreshToken
  const isAccessTokenExpired = hasAccessToken ? tokenUtils.isTokenExpired(stored.tokens!.accessToken) : true
  const isRefreshTokenExpired = hasRefreshToken ? tokenUtils.isTokenExpired(stored.tokens!.refreshToken) : true
  
  const isAuthenticated = !!(user && stored.tokens && (!isAccessTokenExpired || !isRefreshTokenExpired))
  
  return {
    isAuthenticated,
    isLoading,
    user,
    error
  }
}

export const useTokenInfo = () => {
  const stored = authStorage.load()
  
  if (!stored.tokens?.accessToken) {
    return { isExpired: true, expiresAt: null, timeUntilExpiry: null, shouldRefresh: false }
  }
  
  const token = stored.tokens.accessToken
  const isExpired = tokenUtils.isTokenExpired(token)
  const expiresAt = tokenUtils.getTokenExpirationTime(token)
  const timeUntilExpiry = expiresAt ? expiresAt - Date.now() : null
  
  return {
    isExpired,
    expiresAt,
    timeUntilExpiry,
    shouldRefresh: tokenUtils.shouldRefreshToken(token)
  }
}


