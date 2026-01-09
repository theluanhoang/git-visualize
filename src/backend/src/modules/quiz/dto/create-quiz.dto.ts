import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizQuestionType } from '../entities/quiz-question.entity';

export class CreateQuizOptionDTO {
  @ApiProperty({
    description: 'Option text',
    example: 'git init',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Whether this option is correct',
    example: true,
    default: false,
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({
    description: 'Order of option',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateQuizQuestionDTO {
  @ApiProperty({
    description: 'Question text',
    example: 'What command is used to initialize a Git repository?',
  })
  @IsString()
  question: string;

  @ApiPropertyOptional({
    description: 'Question type',
    example: 'single_choice',
    enum: ['single_choice', 'multiple_choice', 'true_false'],
    default: 'single_choice',
  })
  @IsOptional()
  @IsString()
  type?: QuizQuestionType;

  @ApiPropertyOptional({
    description: 'Points for this question',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  points?: number;

  @ApiPropertyOptional({
    description: 'Order of question',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({
    description: 'Explanation for the answer',
    example: 'git init creates a new Git repository in the current directory',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({
    description: 'Options for this question',
    type: [CreateQuizOptionDTO],
    example: [
      { text: 'git init', isCorrect: true, order: 1 },
      { text: 'git create', isCorrect: false, order: 2 },
      { text: 'git new', isCorrect: false, order: 3 },
      { text: 'git start', isCorrect: false, order: 4 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDTO)
  options: CreateQuizOptionDTO[];
}

export class CreateQuizTagDTO {
  @ApiProperty({
    description: 'Tag name',
    example: 'beginner',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Tag color (hex code)',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  color?: string;
}

export class CreateQuizDTO {
  @ApiProperty({
    description: 'Lesson ID that this quiz belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  lessonId: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Git Basics Quiz',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Quiz description',
    example: 'Test your knowledge of basic Git commands',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Quiz difficulty level (1-5)',
    example: 2,
    minimum: 1,
    maximum: 5,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiPropertyOptional({
    description: 'Estimated time to complete in minutes',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedTime?: number;

  @ApiPropertyOptional({
    description: 'Whether quiz is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Quiz order for display',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'Passing score percentage (0-100)',
    example: 70,
    minimum: 0,
    maximum: 100,
    default: 70,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiProperty({
    description: 'Questions for this quiz',
    type: [CreateQuizQuestionDTO],
    example: [
      {
        question: 'What command is used to initialize a Git repository?',
        type: 'single_choice',
        points: 1,
        order: 1,
        options: [
          { text: 'git init', isCorrect: true, order: 1 },
          { text: 'git create', isCorrect: false, order: 2 },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDTO)
  questions: CreateQuizQuestionDTO[];

  @ApiPropertyOptional({
    description: 'Tags for categorizing the quiz',
    type: [CreateQuizTagDTO],
    example: [
      { name: 'beginner', color: '#FF5733' },
      { name: 'git-basics', color: '#33FF57' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizTagDTO)
  tags?: CreateQuizTagDTO[];
}
