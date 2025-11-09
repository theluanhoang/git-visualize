import api from '@/lib/api/axios';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { syncAuthToCookies, clearAuthCookies } from '@/lib/auth/cookie-sync';

export interface AuthUser { 
  id: string; 
  email?: string; 
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' 
}
export interface AuthTokens { accessToken: string; refreshToken: string }

export interface OAuthSessionInfo {
  id: string;
  sessionType: 'PASSWORD' | 'OAUTH';
  oauthProvider?: 'GOOGLE' | 'GITHUB' | 'FACEBOOK';
  userAgent?: string;
  ip?: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export const authApi = {
  register: async (email: string, password: string) => {
    const res = await api.post<{ id: string; email: string; role: string }>(`/api/v1/auth/register`, { email, password });
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post<{ user: AuthUser } & AuthTokens>(`/api/v1/auth/login`, { email, password });
    return res.data;
  },
  refresh: async (userId: string, refreshToken: string) => {
    const res = await api.post<AuthTokens>(`/api/v1/auth/refresh`, { userId, refreshToken });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get<AuthUser>(`/api/v1/users/me`);
    return res.data;
  },
  updateCurrentUser: async (payload: Partial<Pick<AuthUser, 'firstName'|'lastName'|'avatar'>>) => {
    const res = await api.put<AuthUser>(`/api/v1/users/me`, payload);
    return res.data;
  },
  logout: async () => {
    const res = await api.post(`/api/v1/auth/logout`);
    return res.data;
  },
};

export const authStorage = {
  save(tokens: AuthTokens, user: AuthUser) {
    localStorageHelpers.setItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN, tokens.accessToken);
    localStorageHelpers.setItem(LOCALSTORAGE_KEYS.AUTH.REFRESH_TOKEN, tokens.refreshToken);
    localStorageHelpers.setJSON(LOCALSTORAGE_KEYS.AUTH.USER, user);
    
    if (typeof window !== 'undefined') {
      syncAuthToCookies(tokens, user);
    }
  },
  load(): { tokens: AuthTokens | null; user: AuthUser | null } {
    const accessToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
    const refreshToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.REFRESH_TOKEN);
    const user = localStorageHelpers.getJSON<AuthUser | null>(LOCALSTORAGE_KEYS.AUTH.USER, null);
    return {
      tokens: accessToken && refreshToken ? { accessToken, refreshToken } : null,
      user,
    };
  },
  clear() {
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.REFRESH_TOKEN);
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.USER);
    
    if (typeof window !== 'undefined') {
      clearAuthCookies();
    }
  },
  
  saveOAuthSession(sessionInfo: OAuthSessionInfo) {
    localStorageHelpers.setJSON(LOCALSTORAGE_KEYS.AUTH.OAUTH_SESSION, sessionInfo);
  },

  loadOAuthSession(): OAuthSessionInfo | null {
    return localStorageHelpers.getJSON<OAuthSessionInfo | null>(LOCALSTORAGE_KEYS.AUTH.OAUTH_SESSION, null);
  },

  clearOAuthSession() {
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.AUTH.OAUTH_SESSION);
  },
  
  isOAuthUser(): boolean {
    const session = this.loadOAuthSession();
    return session?.sessionType === 'OAUTH' && session?.isActive === true;
  },
  
  getOAuthProvider(): string | null {
    const session = this.loadOAuthSession();
    return session?.oauthProvider || null;
  }
}


