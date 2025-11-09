import api from '@/lib/api/axios';
import { PracticeFormData } from '@/lib/schemas/practice';

export const PracticesService = {
  async getAll(params?: {
    limit?: number;
    offset?: number;
    id?: string;
    lessonId?: string;
    lessonSlug?: string;
    difficulty?: number;
    tag?: string;
    q?: string;
    includeRelations?: boolean;
    isActive?: boolean;
  }) {
    const query: Record<string, unknown> = {};
    if (params?.limit != null) query.limit = Math.min(100, Math.max(1, params.limit));
    if (params?.offset != null) query.offset = params.offset;
    if (params?.id) query.id = params.id;
    if (params?.lessonId) query.lessonId = params.lessonId;
    if (params?.lessonSlug) query.lessonSlug = params.lessonSlug;
    if (params?.difficulty) query.difficulty = params.difficulty;
    if (params?.tag) query.tag = params.tag;
    if (params?.q) query.q = params.q;
    if (params?.includeRelations) query.includeRelations = params.includeRelations;
    if (params?.isActive !== undefined) query.isActive = params.isActive;

    const res = await api.get('/api/v1/practices', { params: query });
    return res.data;
  },

  async getById(id: string) {
    try {
      const res = await api.get('/api/v1/practices', { params: { id, includeRelations: true } });
      if (res.data && res.data.id) {
        return res.data;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  },

  async create(data: PracticeFormData & { lessonId: string }) {
    const payload = {
      lessonId: data.lessonId,
      title: data.title,
      scenario: data.scenario,
      difficulty: data.difficulty,
      estimatedTime: data.estimatedTime,
      isActive: data.isActive,
      order: data.order,
      instructions: data.instructions?.map((instruction, index) => ({
        content: instruction.content,
        order: instruction.order ?? index + 1,
      })),
      hints: data.hints?.map((hint, index) => ({
        content: hint.content,
        order: hint.order ?? index + 1,
      })),
      expectedCommands: data.expectedCommands?.map((command, index) => ({
        command: command.command,
        order: command.order ?? index + 1,
        isRequired: command.isRequired,
      })),
      tags: data.tags?.map((tag) => ({
        name: tag.name,
        color: tag.color,
      })),
      goalRepositoryState: data.goalRepositoryState,
    };
    
    try {
      const res = await api.post('/api/v1/practices', payload);
      return res.data;
    } catch (error: unknown) {
      throw error;
    }
  },

  async update(id: string, data: Partial<PracticeFormData>) {
    const payload: Record<string, unknown> = {};
    if (data.title) payload.title = data.title;
    if (data.scenario) payload.scenario = data.scenario;
    if (data.difficulty) payload.difficulty = data.difficulty;
    if (data.estimatedTime) payload.estimatedTime = data.estimatedTime;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    if (data.order) payload.order = data.order;
    if (data.instructions) {
      payload.instructions = data.instructions.map((instruction, index) => ({
        content: instruction.content,
        order: instruction.order ?? index + 1,
      }));
    }
    if (data.hints) {
      payload.hints = data.hints.map((hint, index) => ({
        content: hint.content,
        order: hint.order ?? index + 1,
      }));
    }
    if (data.expectedCommands) {
      payload.expectedCommands = data.expectedCommands.map((command, index) => ({
        command: command.command,
        order: command.order ?? index + 1,
        isRequired: command.isRequired,
      }));
    }
    if (data.tags) {
      payload.tags = data.tags.map((tag) => ({
        name: tag.name,
        color: tag.color,
      }));
    }
    if (data.goalRepositoryState) {
      payload.goalRepositoryState = data.goalRepositoryState;
    }


    try {
      const res = await api.put(`/api/v1/practices/${id}`, payload);
      return res.data;
    } catch (error: unknown) {
      throw error;
    }
  },

  async delete(id: string) {
    const res = await api.delete(`/api/v1/practices/${id}`);
    return res.data;
  },

  async incrementViews(id: string) {
    const res = await api.post(`/api/v1/practices/${id}/view`);
    return res.data;
  },

  async incrementCompletions(id: string) {
    const res = await api.post(`/api/v1/practices/${id}/complete`);
    return res.data;
  },
};

export default PracticesService;
