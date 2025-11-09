import { api } from '@/lib/api/axios';

export type OAuthProvider = 'google' | 'github' | 'facebook';

export interface OAuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
  };
  isNewUser: boolean;
}

export interface SessionInfo {
  id: string;
  sessionType: 'PASSWORD' | 'OAUTH';
  oauthProvider?: 'GOOGLE' | 'GITHUB' | 'FACEBOOK';
  userAgent?: string;
  ip?: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  isBot: boolean;
}

export interface LocationInfo {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  isp?: string;
}

export interface DeviceInfoResponse {
  device: DeviceInfo;
  location: LocationInfo;
  ip: string;
  userAgent: string;
}

class OAuthService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';


  initiateOAuth(provider: OAuthProvider, locale: string = 'en'): void {
    const oauthUrl = `${this.baseUrl}/api/v1/auth/oauth/${provider}?locale=${locale}`;
    window.location.href = oauthUrl;
  }


  async getActiveSessions(): Promise<{ sessions: SessionInfo[]; total: number }> {
    const response = await api.get('/api/v1/auth/sessions/active');
    return response.data;
  }

  async getOAuthSessions(): Promise<{ sessions: SessionInfo[]; total: number }> {
    const response = await api.get('/api/v1/auth/sessions/oauth');
    return response.data;
  }

  async getCurrentDeviceInfo(): Promise<DeviceInfoResponse> {
    const response = await api.get('/api/v1/auth/sessions/device-info');
    return response.data;
  }

  async unlinkProvider(provider: string): Promise<{ message: string }> {
    const response = await api.post(`/api/v1/auth/oauth/unlink/${provider}`);
    return response.data;
  }

  async getProviderStatus(): Promise<{ 
    google: boolean; 
    github: boolean; 
    facebook: boolean; 
  }> {
    try {
      const [googleStatus, githubStatus, facebookStatus] = await Promise.allSettled([
        api.get('/api/v1/auth/oauth/google'),
        api.get('/api/v1/auth/oauth/github'),
        api.get('/api/v1/auth/oauth/facebook'),
      ]);

      return {
        google: googleStatus.status === 'fulfilled',
        github: githubStatus.status === 'fulfilled',
        facebook: facebookStatus.status === 'fulfilled',
      };
    } catch (error) {
      console.error('Error checking OAuth provider status:', error);
      return {
        google: false,
        github: false,
        facebook: false,
      };
    }
  }

  getProviderDisplayName(provider: OAuthProvider, t?: (key: string) => string): string {
    if (t) {
      return t(provider);
    }
    const names = {
      google: 'Google',
      github: 'GitHub',
      facebook: 'Facebook',
    };
    return names[provider];
  }

  getProviderIcon(provider: OAuthProvider): string {
    const icons = {
      google: '🔵',
      github: '⚫',
      facebook: '🔵',
    };
    return icons[provider];
  }

  getProviderColor(provider: OAuthProvider): string {
    const colors = {
      google: 'bg-red-500 hover:bg-red-600',
      github: 'bg-gray-800 hover:bg-gray-900',
      facebook: 'bg-blue-600 hover:bg-blue-700',
    };
    return colors[provider];
  }

  getProviderTextColor(provider: OAuthProvider): string {
    const colors = {
      google: 'text-white',
      github: 'text-white',
      facebook: 'text-white',
    };
    return colors[provider];
  }
}

export const oauthService = new OAuthService();
