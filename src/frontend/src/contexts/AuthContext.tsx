'use client'

import { createContext, useContext } from 'react'
import { AuthUser, AuthTokens } from '@/services/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (payload: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'avatar'>>) => Promise<void>

  tokens: AuthTokens | null
  refreshToken: () => Promise<void>

  isAdmin: boolean
  hasRole: (role: 'USER' | 'ADMIN') => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

