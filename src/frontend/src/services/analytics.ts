import { LessonsService } from './lessons';
import api from '@/lib/api/axios';
import type { User } from '@/types/user';

interface Lesson {
  id: string | number;
  title: string;
  status: string;
  views: number;
  updatedAt: string;
  createdAt: string;
  slug: string;
}

export interface DashboardStats {
  totalLessons: number;
  totalUsers: number;
  totalViews: number;
  recentActivity: number;
}

export interface TimeData {
  hours: number;
  minutes: number;
}

export interface AnalyticsMetrics {
  totalTimeSpent: TimeData;
  completionRate: number;
  averageSessionTime: TimeData;
  engagementRate: number;
}

export interface RecentUser extends User {}

export interface RecentLesson {
  id: string;
  title: string;
  status: string;
  views: number;
  lastModified: string;
  slug: string;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const AnalyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/v1/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalLessons: 0,
        totalUsers: 0,
        totalViews: 0,
        recentActivity: 0
      };
    }
  },

  async getRecentLessons(limit: number = 10): Promise<RecentLesson[]> {
    try {
      const response = await LessonsService.getAll({ limit, offset: 0 });
      const lessons = response.data || [];
      
      return lessons.map((lesson: Lesson) => ({
        id: String(lesson.id),
        title: lesson.title,
        status: lesson.status,
        views: lesson.views || 0,
        lastModified: lesson.updatedAt || lesson.createdAt,
        slug: lesson.slug
      }));
    } catch (error) {
      console.error('Error fetching recent lessons:', error);
      return [];
    }
  },

  async getUsers(query: GetUsersQuery = {}): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.search) params.append('search', query.search);
      if (query.role) params.append('role', query.role);
      if (query.status) params.append('status', query.status);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);

      const response = await api.get(`/api/v1/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<RecentUser> {
    try {
      const response = await api.patch(`/api/v1/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async sendUserEmail(
    userId: string,
    subject: string,
    message: string,
    attachments?: File[],
    onProgress?: (percent: number, loaded: number, total?: number) => void
  ): Promise<void> {
    try {
      const form = new FormData();
      form.append('subject', subject);
      form.append('message', message);
      (attachments || []).forEach((file) => form.append('attachments', file));

      await api.post(`/api/v1/admin/users/${userId}/email`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const total = evt.total || 0;
          const loaded = evt.loaded;
          const percent = total ? Math.round((loaded * 100) / total) : 0;
          onProgress?.(percent, loaded, total);
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    try {
      const response = await api.get('/api/v1/admin/analytics/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return {
        totalTimeSpent: { hours: 0, minutes: 0 },
        completionRate: 0,
        averageSessionTime: { hours: 0, minutes: 0 },
        engagementRate: 0
      };
    }
  }
  ,
  async getDeviceUsage(): Promise<Array<{ device: string; count: number }>> {
    try {
      const response = await api.get('/api/v1/admin/analytics/device-usage');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching device usage:', error);
      return [];
    }
  },

  async getHourlyActivity(date?: string): Promise<Array<{ hour: string; users: number }>> {
    try {
      const url = date ? `/api/v1/admin/analytics/hourly-activity?date=${encodeURIComponent(date)}` : '/api/v1/admin/analytics/hourly-activity';
      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching hourly activity:', error);
      return Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2,'0')}:00`, users: 0 }));
    }
  }
};
