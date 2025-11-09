import api from '@/lib/api/axios';

export interface CreateRatingDto {
  rating: number;
  comment?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface RatingResponse {
  id: string;
  userId: string;
  lessonId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserInfo;
}

export interface LessonRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const RatingsService = {
  async createRating(lessonId: string, dto: CreateRatingDto): Promise<RatingResponse> {
    const response = await api.post(`/api/v1/lesson/${lessonId}/rating`, dto);
    return response.data;
  },

  async updateRating(lessonId: string, dto: CreateRatingDto): Promise<RatingResponse> {
    const response = await api.patch(`/api/v1/lesson/${lessonId}/rating`, dto);
    return response.data;
  },

  async deleteRating(lessonId: string): Promise<void> {
    await api.delete(`/api/v1/lesson/${lessonId}/rating`);
  },

  async getUserRating(lessonId: string): Promise<RatingResponse | null> {
    try {
      const response = await api.get(`/api/v1/lesson/${lessonId}/rating`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getLessonRatingStats(lessonId: string): Promise<LessonRatingStats> {
    const response = await api.get(`/api/v1/lesson/${lessonId}/rating/stats`);
    return response.data;
  },

  async getLessonRatings(lessonId: string): Promise<RatingResponse[]> {
    const response = await api.get(`/api/v1/lesson/${lessonId}/ratings`);
    return response.data;
  },
};

