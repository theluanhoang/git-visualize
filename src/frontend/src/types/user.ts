export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus | string;
  joinedAt: string;
  avatar?: string | null;
  lastActive?: string;
  lessonsCompleted?: number;
  totalTimeSpent?: string;
  progress?: number;
  achievements?: number;
  totalSessions?: number;
  activeSessions?: number;
  oauthSessions?: number;
  lastLoginAt?: string | Date | null;
}


