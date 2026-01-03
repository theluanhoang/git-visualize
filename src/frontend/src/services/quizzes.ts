import { api } from '@/lib/api/axios';

export type QuizQuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  difficulty: number;
  estimatedTime: number;
  isActive: boolean;
  order: number;
  views: number;
  completions: number;
  passingScore: number;
  lessonId: string;
  questions?: QuizQuestion[];
  tags?: QuizTag[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  points: number;
  order: number;
  explanation?: string;
  quizId: string;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  questionId: string;
}

export interface QuizTag {
  id: string;
  name: string;
  color?: string;
  quizId: string;
}

export interface GetQuizzesResponse {
  data: Quiz[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetQuizzesQuery {
  id?: string;
  lessonId?: string;
  lessonSlug?: string;
  difficulty?: number;
  tag?: string;
  includeRelations?: boolean;
  limit?: number;
  offset?: number;
}

export class QuizzesService {
  static async getQuizzes(query: GetQuizzesQuery = {}): Promise<GetQuizzesResponse | Quiz> {
    const params = new URLSearchParams();
    
    if (query.id) params.append('id', query.id);
    if (query.lessonId) params.append('lessonId', query.lessonId);
    if (query.lessonSlug) params.append('lessonSlug', query.lessonSlug);
    if (query.difficulty) params.append('difficulty', query.difficulty.toString());
    if (query.tag) params.append('tag', query.tag);
    if (query.includeRelations) params.append('includeRelations', 'true');
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    const response = await api.get(`/api/v1/quizzes?${params.toString()}`);
    return response.data;
  }

  static async getQuizById(id: string): Promise<Quiz> {
    const response = await api.get(`/api/v1/quizzes?id=${id}&includeRelations=true`);
    return response.data;
  }

  static async getQuizzesByLessonSlug(lessonSlug: string): Promise<Quiz[]> {
    const response = await api.get(`/api/v1/quizzes?lessonSlug=${lessonSlug}&includeRelations=true`);
    return response.data.data || [];
  }

  static async incrementViews(id: string): Promise<void> {
    await api.post(`/api/v1/quizzes/${id}/view`);
  }

  static async incrementCompletions(id: string): Promise<void> {
    await api.post(`/api/v1/quizzes/${id}/complete`);
  }

  static async create(data: CreateQuizData): Promise<Quiz> {
    const response = await api.post('/api/v1/quizzes', data);
    return response.data;
  }

  static async update(id: string, data: UpdateQuizData): Promise<Quiz> {
    const response = await api.put(`/api/v1/quizzes/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/api/v1/quizzes/${id}`);
  }
}

export interface CreateQuizData {
  lessonId: string;
  title: string;
  description?: string;
  difficulty?: number;
  estimatedTime?: number;
  isActive?: boolean;
  order?: number;
  passingScore?: number;
  questions: CreateQuizQuestionData[];
  tags?: CreateQuizTagData[];
}

export interface UpdateQuizData extends Partial<CreateQuizData> {}

export interface CreateQuizQuestionData {
  question: string;
  type?: QuizQuestionType;
  points?: number;
  order?: number;
  explanation?: string;
  options: CreateQuizOptionData[];
}

export interface CreateQuizOptionData {
  text: string;
  isCorrect: boolean;
  order?: number;
}

export interface CreateQuizTagData {
  name: string;
  color?: string;
}
















