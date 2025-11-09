export interface Instruction {
  id?: string;
  content: string;
  order: number;
  practiceId?: string;
}

export interface Hint {
  id?: string;
  content: string;
  order: number;
  practiceId?: string;
}

export interface ExpectedCommand {
  id?: string;
  command: string;
  order: number;
  practiceId?: string;
}

export interface ValidationRule {
  id?: string;
  rule: string;
  order: number;
  practiceId?: string;
}

export interface Tag {
  id?: string;
  name: string;
  practiceId?: string;
}

export interface PracticeCreationDto {
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: number;
  lessonId: string;
  instructions: Instruction[];
  hints: Hint[];
  expectedCommands: ExpectedCommand[];
  validationRules: ValidationRule[];
  tags: Tag[];
}

export interface PracticeUpdateDto {
  title?: string;
  description?: string;
  difficulty?: string;
  estimatedTime?: number;
  instructions?: Instruction[];
  hints?: Hint[];
  expectedCommands?: ExpectedCommand[];
  validationRules?: ValidationRule[];
  tags?: Tag[];
}

export interface PracticeResponse {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: number;
  lessonId: string;
  instructions: Instruction[];
  hints: Hint[];
  expectedCommands: ExpectedCommand[];
  validationRules: ValidationRule[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonResponse {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  practices: PracticeResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
