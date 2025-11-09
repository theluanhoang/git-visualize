import { Lesson } from '../lesson.entity';
import { Practice } from '../../practice/entities/practice.entity';

/**
 * Base response structure for paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Lesson with practices included
 */
export interface LessonWithPractices extends Lesson {
  practices: Practice[];
}

/**
 * Generic response type for getLessons method
 * T can be either Lesson or LessonWithPractices
 */
export type GetLessonsResponse<T extends Lesson = Lesson> = PaginatedResponse<T>;

/**
 * Type guard to check if lesson has practices
 */
export function lessonHasPractices(lesson: Lesson): lesson is LessonWithPractices {
  return 'practices' in lesson;
}

/**
 * Type guard to check if response includes practices
 */
export function responseHasPractices(
  response: GetLessonsResponse<Lesson | LessonWithPractices>
): response is GetLessonsResponse<LessonWithPractices> {
  return response.data.length > 0 && lessonHasPractices(response.data[0]);
}
