import { NextRequest } from 'next/server';

export const AUTH_COOKIE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
} as const;

export function getAuthTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(AUTH_COOKIE_KEYS.ACCESS_TOKEN)?.value || null;
}

export function getUserFromCookies(request: NextRequest): { id: string; role: 'USER' | 'ADMIN' } | null {
  const userCookie = request.cookies.get(AUTH_COOKIE_KEYS.USER)?.value;
  if (!userCookie) return null;
  
  try {
    const user = JSON.parse(userCookie);
    return {
      id: user.id,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

export function isAdmin(user: { role: 'USER' | 'ADMIN' } | null): boolean {
  return user?.role === 'ADMIN' || false;
}

export function isAuthenticated(request: NextRequest): boolean {
  const token = getAuthTokenFromCookies(request);
  return isTokenValid(token);
}

