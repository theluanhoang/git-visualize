import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LessonFormData, LessonUpdateData } from '@/lib/schemas/lesson';
import { LessonsService } from '@/services/lessons';
import { lessonKeys, analyticsKeys } from '@/lib/react-query/query-keys';

const lessonsApi = {
  getAll: async () => {
    return [
      {
        id: 1,
        title: 'Git Basics - Introduction',
        slug: 'git-basics-introduction',
        description: 'Học những khái niệm cơ bản về Git và version control',
        status: 'published',
        views: 245,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        author: 'Admin',
        sections: 4,
        estimatedTime: '30 phút'
      },
    ];
  },
  
  getById: async (id: string) => {
    return {
      id,
      title: 'Git Basics - Introduction',
      slug: 'git-basics-introduction',
      description: 'Học những khái niệm cơ bản về Git và version control',
      content: '<p>Nội dung bài học...</p>',
      status: 'published',
      prerequisites: [],
      estimatedTime: '30 phút',
      difficulty: 'beginner',
      tags: ['git', 'basics'],
      featured: false,
      allowComments: true
    };
  },
  
  create: async (data: LessonFormData) => {
    return LessonsService.create(data);
  },
  
  update: async (id: string, data: LessonUpdateData) => {
    return LessonsService.update(id, data);
  },
  
  delete: async (id: string) => {
    return LessonsService.delete(id);
  }
};

export const useLessons = (params: {
  limit?: number;
  offset?: number;
  id?: string;
  slug?: string;
  status?: 'draft' | 'published';
  q?: string;
  includePractices?: boolean;
  enabled?: boolean;
} = {}) => {
  const { enabled = true, ...queryParams } = params;
  return useQuery({
    queryKey: lessonKeys.list(queryParams),
    queryFn: async () => {
      const res = await LessonsService.getAll(queryParams);
      return res.data;
    },
    enabled,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: lessonsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LessonUpdateData }) => 
      lessonsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: lessonsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
};

export const useGenerateLesson = () => {
  return useMutation({
    mutationFn: async (params: {
      sourceType: 'url' | 'file';
      url?: string;
      file?: File;
      language?: 'vi' | 'en';
      model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
      outlineStyle?: 'concise' | 'detailed';
      additionalInstructions?: string;
    }) => {
      const { LessonsService } = await import('@/services/lessons');
      return LessonsService.generateLesson(params);
    },
  });
};

export const useTrackLessonView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { LessonsService } = await import('@/services/lessons');
      return LessonsService.trackView(lessonId);
    },
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.views.myViews() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.views.stats(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.views.hasViewed(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

export const useMyLessonViews = (params?: {
  limit?: number;
  offset?: number;
  orderBy?: 'viewedAt' | 'lastViewedAt' | 'viewCount';
  order?: 'ASC' | 'DESC';
}) => {
  return useQuery({
    queryKey: lessonKeys.views.myViews(params),
    queryFn: async () => {
      const { LessonsService } = await import('@/services/lessons');
      return LessonsService.getMyViews(params);
    },
    enabled: true,
  });
};

export const useLessonViewStats = (lessonId: string, enabled = true) => {
  return useQuery({
    queryKey: lessonKeys.views.stats(lessonId),
    queryFn: async () => {
      const { LessonsService } = await import('@/services/lessons');
      return LessonsService.getViewStats(lessonId);
    },
    enabled: enabled && !!lessonId,
  });
};

export const useHasViewedLesson = (lessonId: string, enabled = true) => {
  return useQuery({
    queryKey: lessonKeys.views.hasViewed(lessonId),
    queryFn: async () => {
      const { LessonsService } = await import('@/services/lessons');
      return LessonsService.hasViewed(lessonId);
    },
    enabled: enabled && !!lessonId,
    staleTime: 1000 * 60 * 5,
  });
};
