import api from '@/lib/api/axios';
import { LessonFormData, LessonUpdateData, LessonWithPractices } from '@/lib/schemas/lesson';
import { PracticeFormData } from '@/lib/schemas/practice';

interface LessonResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  practices?: PracticeFormData[];
}

const toBackendStatus = (status: string) => {
  switch (status) {
    case 'draft':
      return 'DRAFT';
    case 'published':
      return 'PUBLISHED';
    default:
      return 'DRAFT';
  }
};

const fromBackendStatus = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'draft';
    case 'PUBLISHED':
      return 'published';
    case 'REMOVED':
      return 'draft';
    default:
      return 'draft';
  }
};

export const LessonsService = {
  async getAll(params?: {
    limit?: number;
    offset?: number;
    id?: string;
    slug?: string;
    status?: 'draft' | 'published';
    q?: string;
    includePractices?: boolean;
  }) {
    const query: Record<string, unknown> = {};
    if (params?.limit != null) query.limit = Math.min(100, Math.max(1, params.limit));
    if (params?.offset != null) query.offset = params.offset;
    if (params?.id != null) query.id = params.id;
    if (params?.slug) query.slug = params.slug;
    if (params?.status) query.status = toBackendStatus(params.status);
    if (params?.q) query.q = params.q;
    if (params?.includePractices) query.includePractices = params.includePractices;

    const res = await api.get('/api/v1/lesson', { params: query });
    const { data, total, limit, offset } = res.data as {
      data: Array<{
        id: string;
        title: string;
        slug: string;
        description: string;
        content: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        views: number;
        averageRating?: number;
        completedUsersCount?: number;
        practices?: PracticeFormData[];
      }>;
      total: number;
      limit: number;
      offset: number;
    };
    const mapped = data.map((l) => ({
      ...l,
      status: fromBackendStatus(l.status),
    }));
    return { data: mapped, total, limit, offset };
  },
  async getBySlug(slug: string) {
    const res = await api.get('/api/v1/lesson', { params: { slug } });
    const { data } = res.data as { data: Array<{
      id: number;
      title: string;
      slug: string;
      description: string;
      content: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      views: number;
    }> };
    if (!data?.length) return null;
    const lesson = data[0];
    return { ...lesson, id: lesson.id.toString(), status: fromBackendStatus(lesson.status) };
  },
  async getBySlugWithPractices(slug: string): Promise<LessonWithPractices | null> {
    const res = await api.get('/api/v1/lesson', { params: { slug, includePractices: true } });
    const { data } = res.data as { data: LessonResponse[] };
    if (!data?.length) return null;
    const lesson = data[0];
    return { ...lesson, id: lesson.id.toString(), status: fromBackendStatus(lesson.status) };
  },
  async create(data: LessonFormData) {
    const payload = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      status: toBackendStatus(data.status),
    };
    const res = await api.post('/api/v1/lesson', payload);
    return res.data;
  },
  async update(id: string, data: LessonUpdateData) {
    const payload: Record<string, unknown> = { ...data };
    if (data.status) payload.status = toBackendStatus(data.status);
    const res = await api.patch(`/api/v1/lesson/${id}`, payload);
    return res.data;
  },
  async updatePractice(id: number, practice: PracticeFormData) {
    const res = await api.patch(`/api/v1/lesson/${id}`, { practice });
    return res.data;
  },
  async getPracticeBySlug(slug: string): Promise<PracticeFormData | null> {
    const res = await api.get('/api/v1/lesson', { params: { slug } });
    const { data } = res.data as { data: Array<{ practice?: PracticeFormData }> };
    if (!data?.length) return null;
    return data[0]?.practice ?? null;
  },
  async delete(id: string) {
    const res = await api.delete(`/api/v1/lesson/${id}`);
    return res.data;
  },
  async generateLesson(params: {
    sourceType: 'url' | 'file';
    url?: string;
    file?: File;
    language?: 'vi' | 'en';
    model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    outlineStyle?: 'concise' | 'detailed';
    additionalInstructions?: string;
  }) {
    const { data, config } = buildGenerateLessonRequest(params);
    const res = await api.post('/api/v1/lesson/generate', data, config);
    return res.data;
  },
  async trackView(lessonId: string) {
    const res = await api.post('/api/v1/lesson/track-view', { lessonId });
    return res.data;
  },
  async getMyViews(params?: {
    limit?: number;
    offset?: number;
    orderBy?: 'viewedAt' | 'lastViewedAt' | 'viewCount';
    order?: 'ASC' | 'DESC';
  }) {
    const query: Record<string, unknown> = {};
    if (params?.limit != null) query.limit = params.limit;
    if (params?.offset != null) query.offset = params.offset;
    if (params?.orderBy) query.orderBy = params.orderBy;
    if (params?.order) query.order = params.order;

    const res = await api.get('/api/v1/lesson/my-views', { params: query });
    return res.data as { data: Array<{
      id: string;
      userId: string;
      lessonId: string;
      viewedAt: string;
      viewCount: number;
      lastViewedAt: string;
      lesson?: LessonResponse;
    }>; total: number };
  },
  async getViewStats(lessonId: string) {
    const res = await api.get(`/api/v1/lesson/${lessonId}/view-stats`);
    return res.data as {
      totalViews: number;
      uniqueViewers: number;
      averageViewsPerUser: number;
    };
  },
  async hasViewed(lessonId: string) {
    const res = await api.get(`/api/v1/lesson/${lessonId}/has-viewed`);
    return res.data as {
      hasViewed: boolean;
      viewCount: number;
    };
  },
};

export default LessonsService;

function buildGenerateLessonRequest(params: {
  sourceType: 'url' | 'file';
  url?: string;
  file?: File;
  language?: 'vi' | 'en';
  model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  outlineStyle?: 'concise' | 'detailed';
  additionalInstructions?: string;
}): { data: FormData | Record<string, unknown>; config?: { headers?: Record<string, string> } } {
  const isFileUpload = params.sourceType === 'file' || Boolean(params.file);

  if (isFileUpload) {
    const formData = new FormData();
    formData.append('sourceType', 'file');
    appendIfDefined(formData, 'url', params.url);
    if (params.file) formData.append('file', params.file);
    appendIfDefined(formData, 'language', params.language);
    appendIfDefined(formData, 'model', params.model);
    appendIfDefined(formData, 'outlineStyle', params.outlineStyle);
    appendIfDefined(formData, 'additionalInstructions', params.additionalInstructions);

    return {
      data: formData,
      config: { headers: { 'Content-Type': 'multipart/form-data' } },
    };
  }

  const jsonPayload: Record<string, unknown> = cleanUndefined({
    sourceType: 'url',
    url: params.url,
    language: params.language,
    model: params.model,
    outlineStyle: params.outlineStyle,
    additionalInstructions: params.additionalInstructions,
  });

  return { data: jsonPayload, config: { headers: { 'Content-Type': 'application/json' } } };
}

function appendIfDefined(fd: FormData, key: string, value: string | undefined | null) {
  if (value != null && value !== '') {
    fd.append(key, value as string);
  }
}

function cleanUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj } as T;
  Object.keys(out).forEach((k) => (out as any)[k] === undefined && delete (out as any)[k]);
  return out;
}
