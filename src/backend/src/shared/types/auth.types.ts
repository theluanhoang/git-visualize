import { EUserRole } from '../../modules/users/user.interface';

/**
 * JWT Payload interface
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  role?: EUserRole;
  iat?: number;
  exp?: number;
  typ?: string;
}

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: EUserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  get(header: string): string | undefined;
  ip?: string;
  connection?: {
    remoteAddress?: string;
  };
}

export interface OAuthProfile {
  id: string;
  emails: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  name?: {
    givenName?: string;
    familyName?: string;
    displayName?: string;
  };
  username?: string;
  displayName?: string;
}

export interface OAuthCallback {
  (error: any, user?: any): void;
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

export interface SessionDetails {
  id: string;
  sessionType: string;
  oauthProvider?: string;
  oauthProviderId?: string;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
  expiresAt: Date;
  oauthTokenExpiresAt?: Date;
  isActive: boolean;
}

export interface ActiveSessionsResponse {
  sessions: SessionDetails[];
  total: number;
}

export interface OAuthSessionsResponse {
  sessions: SessionDetails[];
  total: number;
}

export interface DeviceInfoResponse {
  device?: DeviceInfo;
  location?: LocationInfo;
  ip?: string;
  userAgent?: string;
  error?: string;
}
