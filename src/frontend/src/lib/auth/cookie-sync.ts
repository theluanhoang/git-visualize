import { AUTH_COOKIE_KEYS } from '../middleware/auth';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import type { AuthUser, AuthTokens } from '@/services/auth';

const COOKIE_CONFIG = {
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

function setCookie(name: string, value: string, maxAge: number = COOKIE_CONFIG.maxAge): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + maxAge * 1000);
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=${COOKIE_CONFIG.path}; SameSite=${COOKIE_CONFIG.sameSite}${COOKIE_CONFIG.secure ? '; Secure' : ''}`;
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_CONFIG.path};`;
}

export function syncAuthToCookies(tokens: AuthTokens, user: AuthUser): void {
  if (typeof document === 'undefined') return;
  
  try {
    if (tokens.accessToken) {
      setCookie(AUTH_COOKIE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    }
    
    if (tokens.refreshToken) {
      setCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    
    if (user) {
      const userData = {
        id: user.id,
        role: user.role,
      };
      setCookie(AUTH_COOKIE_KEYS.USER, JSON.stringify(userData));
    }
  } catch (error) {
    console.warn('Failed to sync auth to cookies:', error);
  }
}

export function syncFromLocalStorage(): void {
  if (typeof document === 'undefined') return;
  
  try {
    const accessToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
    const refreshToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.REFRESH_TOKEN);
    const user = localStorageHelpers.getJSON<AuthUser | null>(LOCALSTORAGE_KEYS.AUTH.USER, null);
    
    if (accessToken && refreshToken && user) {
      syncAuthToCookies(
        { accessToken, refreshToken },
        user
      );
    }
  } catch (error) {
    console.warn('Failed to sync from localStorage:', error);
  }
}

export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return;
  
  removeCookie(AUTH_COOKIE_KEYS.ACCESS_TOKEN);
  removeCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN);
  removeCookie(AUTH_COOKIE_KEYS.USER);
}

