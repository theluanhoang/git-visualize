import { api } from '@/lib/api/axios';
import { IRepositoryState } from '@/types/git';

export interface Practice {
  id: string;
  title: string;
  scenario: string;
  difficulty: number;
  estimatedTime: number;
  isActive: boolean;
  order: number;
  version: number;
  views: number;
  completions: number;
  lessonId: string;
  goalRepositoryState?: IRepositoryState;
  instructions?: PracticeInstruction[];
  hints?: PracticeHint[];
  expectedCommands?: PracticeExpectedCommand[];
  validationRules?: PracticeValidationRule[];
  tags?: PracticeTag[];
  createdAt: string;
  updatedAt: string;
}

export interface PracticeInstruction {
  id: string;
  content: string;
  order: number;
  practiceId: string;
}

export interface PracticeHint {
  id: string;
  content: string;
  order: number;
  practiceId: string;
}

export interface PracticeExpectedCommand {
  id: string;
  command: string;
  order: number;
  isRequired: boolean;
  practiceId: string;
}

export interface PracticeValidationRule {
  id: string;
  type: 'MIN_COMMANDS' | 'REQUIRED_COMMANDS' | 'EXACT_SEQUENCE' | 'CUSTOM';
  value: string;
  message: string;
  order: number;
  practiceId: string;
}

export interface PracticeTag {
  id: string;
  name: string;
  color: string;
  practiceId: string;
}

export interface GetPracticesResponse {
  data: Practice[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetPracticesQuery {
  id?: string;
  lessonSlug?: string;
  difficulty?: number;
  tag?: string;
  includeRelations?: boolean;
  limit?: number;
  offset?: number;
}

export class PracticesService {
  static async getPractices(query: GetPracticesQuery = {}): Promise<GetPracticesResponse | Practice> {
    const params = new URLSearchParams();
    
    if (query.id) params.append('id', query.id);
    if (query.lessonSlug) params.append('lessonSlug', query.lessonSlug);
    if (query.difficulty) params.append('difficulty', query.difficulty.toString());
    if (query.tag) params.append('tag', query.tag);
    if (query.includeRelations) params.append('includeRelations', 'true');
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    const response = await api.get(`/api/v1/practices?${params.toString()}`);
    return response.data;
  }

  static async getPracticeById(id: string): Promise<Practice> {
    const response = await api.get(`/api/v1/practices?id=${id}&includeRelations=true`);
    return response.data;
  }

  static async getPracticesByLessonSlug(lessonSlug: string): Promise<Practice[]> {
    const response = await api.get(`/api/v1/practices?lessonSlug=${lessonSlug}&includeRelations=true`);
    return response.data.data || [];
  }

  static async getPracticesByDifficulty(difficulty: number): Promise<Practice[]> {
    const response = await api.get(`/api/v1/practices?difficulty=${difficulty}&includeRelations=true`);
    return response.data.data || [];
  }

  static async incrementViews(id: string): Promise<void> {
    await api.post(`/api/v1/practices/${id}/view`);
  }

  static async incrementCompletions(id: string): Promise<void> {
    await api.post(`/api/v1/practices/${id}/complete`);
  }

  static async validatePractice(practiceId: string, userRepositoryState: IRepositoryState) {
    const res = await api.post('/api/v1/git/validate-practice', {
      practiceId,
      userRepositoryState,
    });
    return res.data as {
      success: boolean;
      isCorrect: boolean;
      score: number;
      feedback: string;
      differences: Array<{ type: 'commit' | 'branch' | 'tag' | 'head'; field: string; expected: unknown; actual: unknown; description: string }>;
      message: string;
    };
  }
}
