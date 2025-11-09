import { z } from 'zod';
import { PracticeFormData } from './practice';

export const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200, 'Tiêu đề không được quá 200 ký tự'),
  slug: z.string().min(1, 'Slug là bắt buộc').regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
  description: z.string().min(1, 'Mô tả là bắt buộc').max(500, 'Mô tả không được quá 500 ký tự'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  status: z.enum(['draft', 'published'])
});

export const lessonUpdateSchema = lessonSchema.partial();

export type LessonFormData = z.infer<typeof lessonSchema>;
export type LessonUpdateData = z.infer<typeof lessonUpdateSchema>;

export interface LessonWithPractices extends LessonFormData {
  practices?: PracticeFormData[];
}
