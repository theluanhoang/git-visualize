import { z } from 'zod';

export const practiceInstructionSchema = z.object({
  content: z.string().min(1, 'Instruction content is required'),
  order: z.number().min(0).optional(),
});

export const practiceHintSchema = z.object({
  content: z.string().min(1, 'Hint content is required'),
  order: z.number().min(0).optional(),
});

export const practiceExpectedCommandSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  order: z.number().min(0).optional(),
  isRequired: z.boolean(),
});

export const practiceValidationRuleSchema = z.object({
  type: z.string().min(1, 'Validation rule type is required'),
  value: z.string().min(1, 'Validation rule value is required'),
  message: z.string().optional(),
  order: z.number().min(0).optional(),
});

export const practiceTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().optional(),
});

export const practiceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Practice title is required'),
  scenario: z.string().min(1, 'Practice scenario is required'),
  difficulty: z.number().min(1).max(5),
  estimatedTime: z.number().min(0),
  isActive: z.boolean(),
  order: z.number().min(0),
  instructions: z.array(practiceInstructionSchema).optional(),
  hints: z.array(practiceHintSchema).optional(),
  expectedCommands: z.array(practiceExpectedCommandSchema).optional(),
  validationRules: z.array(practiceValidationRuleSchema).optional(),
  tags: z.array(practiceTagSchema).optional(),
  goalRepositoryState: z.any().optional(),
});

export type PracticeFormData = z.infer<typeof practiceSchema>;
export type PracticeInstructionData = z.infer<typeof practiceInstructionSchema>;
export type PracticeHintData = z.infer<typeof practiceHintSchema>;
export type PracticeExpectedCommandData = z.infer<typeof practiceExpectedCommandSchema>;
export type PracticeValidationRuleData = z.infer<typeof practiceValidationRuleSchema>;
export type PracticeTagData = z.infer<typeof practiceTagSchema>;
