import { z } from 'zod';

export const quizOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  order: z.number().min(0).optional(),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['single_choice', 'multiple_choice', 'true_false']).default('single_choice'),
  points: z.number().min(1).default(1),
  order: z.number().min(0).optional(),
  explanation: z.string().optional(),
  options: z.array(quizOptionSchema).min(2, 'At least 2 options are required'),
}).refine(
  (data) => {
    if (data.type === 'single_choice' || data.type === 'true_false') {
      return data.options.filter(opt => opt.isCorrect).length === 1;
    }
    return data.options.filter(opt => opt.isCorrect).length >= 1;
  },
  {
    message: 'Single choice and true/false questions must have exactly 1 correct answer. Multiple choice must have at least 1 correct answer.',
  }
);

export const quizTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().optional().default('#3B82F6'),
});

export const quizSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  difficulty: z.number().min(1).max(5),
  estimatedTime: z.number().min(0),
  isActive: z.boolean(),
  order: z.number().min(0),
  passingScore: z.number().min(0).max(100),
  questions: z.array(quizQuestionSchema).min(1, 'At least 1 question is required'),
  tags: z.array(quizTagSchema).optional(),
});

export type QuizFormData = z.infer<typeof quizSchema>;
export type QuizQuestionData = z.infer<typeof quizQuestionSchema>;
export type QuizOptionData = z.infer<typeof quizOptionSchema>;
export type QuizTagData = z.infer<typeof quizTagSchema>;











