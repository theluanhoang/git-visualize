'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { AuthContext, AuthContextValue } from './AuthContext'
import { authApi, authStorage, AuthUser, AuthTokens } from '@/services/auth'
import { useCurrentUser, useLogin, useRegister, useLogout, useUpdateProfile } from '@/lib/react-query/hooks/use-auth'
import { useQueryClient } from '@tanstack/react-query'
import { tokenUtils } from '@/lib/api/axios'
import api from '@/lib/api/axios'
import { syncFromLocalStorage, syncAuthToCookies } from '@/lib/auth/cookie-sync'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: user, isLoading: isLoadingUser, error: userError, refetch: refetchUser } = useCurrentUser()
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()
  const updateProfileMutation = useUpdateProfile()

  useEffect(() => {
    const stored = authStorage.load()
    
    if (stored.tokens?.accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored.tokens.accessToken}`
      
      if (stored.tokens && stored.user) {
        syncAuthToCookies(stored.tokens, stored.user)
      }
      
      if (tokenUtils.isTokenExpired(stored.tokens.accessToken) || tokenUtils.shouldRefreshToken(stored.tokens.accessToken)) {
        refetchUser()
      }
    } else {
      syncFromLocalStorage()
    }
    
    setIsInitialized(true)
  }, [refetchUser])

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      authStorage.clear()
      queryClient.clear()
      // Get locale from current pathname
      const currentPath = window.location.pathname
      const localeMatch = currentPath.match(/^\/(en|vi)/)
      const locale = localeMatch ? localeMatch[1] : 'en'
      window.location.href = `/${locale}/auth/login`
    }
  }, [logoutMutation, queryClient])

  const handleRefreshToken = useCallback(async () => {
    try {
      const stored = authStorage.load()
      const refreshTokenValue = stored.tokens?.refreshToken
      const userId = stored.user?.id || user?.id

      if (!refreshTokenValue || !userId) {
        throw new Error('No refresh token or user ID available')
      }

      const response = await authApi.refresh(userId, refreshTokenValue)
      
      const currentUser = stored.user || user
      if (currentUser) {
        authStorage.save(response, currentUser)
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`

      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    } catch (error) {
      console.error('Failed to refresh token:', error)
      handleLogout()
    }
  }, [user, queryClient, handleLogout])

  useEffect(() => {
    if (!user) return

    const stored = authStorage.load()
    const accessToken = stored.tokens?.accessToken

    if (!accessToken) return

    const expiresAt = tokenUtils.getTokenExpirationTime(accessToken)
    if (!expiresAt) return

    const refreshBuffer = 30 * 1000 // 30 seconds
    const timeUntilRefresh = expiresAt - Date.now() - refreshBuffer

    if (timeUntilRefresh <= 0) {
      handleRefreshToken()
      return
    }

    const timeoutId = setTimeout(() => {
      handleRefreshToken()
    }, timeUntilRefresh)

    return () => clearTimeout(timeoutId)
  }, [user, handleRefreshToken])

  const handleLogin = useCallback(async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }, [loginMutation])

  const handleRegister = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const response = await registerMutation.mutateAsync({ email, password })
    return response as AuthUser
  }, [registerMutation])

  const handleUpdateProfile = useCallback(async (
    payload: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'avatar'>>
  ) => {
    try {
      await updateProfileMutation.mutateAsync(payload)
    } catch (error) {
      throw error
    }
  }, [updateProfileMutation])

  const handleRefreshUser = useCallback(async () => {
    await refetchUser()
  }, [refetchUser])

  const stored = useMemo(() => authStorage.load(), [user])
  const tokens = stored.tokens
  const isAuthenticated = useMemo(() => {
    if (!user || !tokens) return false
    
    const hasAccessToken = !!tokens.accessToken
    const hasRefreshToken = !!tokens.refreshToken
    const isAccessTokenExpired = hasAccessToken ? tokenUtils.isTokenExpired(tokens.accessToken) : true
    const isRefreshTokenExpired = hasRefreshToken ? tokenUtils.isTokenExpired(tokens.refreshToken) : true

    return hasAccessToken && hasRefreshToken && (!isAccessTokenExpired || !isRefreshTokenExpired)
  }, [user, tokens])

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user])
  const hasRole = useCallback((role: 'USER' | 'ADMIN') => {
    return user?.role === role
  }, [user])

  const isLoading = !isInitialized || isLoadingUser

  const error = useMemo(() => {
    return (userError as Error | null) || 
      (loginMutation.error as Error | null) ||
      (registerMutation.error as Error | null) ||
      (logoutMutation.error as Error | null) ||
      (updateProfileMutation.error as Error | null)
  }, [userError, loginMutation.error, registerMutation.error, logoutMutation.error, updateProfileMutation.error])

  const value: AuthContextValue = {
    user: user || null,
    isAuthenticated,
    isLoading,
    error,

    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser: handleRefreshUser,
    updateProfile: handleUpdateProfile,

    tokens,
    refreshToken: handleRefreshToken,

    isAdmin,
    hasRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

