import { IsEnum, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SourceType {
  URL = 'url',
  FILE = 'file',
}

export enum Language {
  VI = 'vi',
  EN = 'en',
}

export enum ModelType {
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-2.5-pro',
}

export enum OutlineStyle {
  CONCISE = 'concise',
  DETAILED = 'detailed',
}

export class GenerateLessonDto {
  @ApiProperty({
    enum: SourceType,
    description: 'Type of source content',
    example: SourceType.URL,
  })
  @IsEnum(SourceType)
  sourceType: SourceType;

  @ApiProperty({
    description: 'URL to extract content from (required if sourceType is URL)',
    example: 'https://git-scm.com/docs/git-branch',
    required: false,
  })
  @ValidateIf((o) => o.sourceType === SourceType.URL)
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'File ID for uploaded file (required if sourceType is FILE)',
    example: 'file_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileId?: string;

  @ApiProperty({
    enum: Language,
    description: 'Target language for generated content',
    example: Language.VI,
    default: Language.VI,
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language = Language.VI;

  @ApiProperty({
    enum: ModelType,
    description: 'AI model to use for generation',
    example: ModelType.GEMINI_FLASH,
    default: ModelType.GEMINI_FLASH,
  })
  @IsEnum(ModelType)
  @IsOptional()
  model?: ModelType = ModelType.GEMINI_FLASH;

  @ApiProperty({
    enum: OutlineStyle,
    description: 'Style of lesson outline',
    example: OutlineStyle.DETAILED,
    default: OutlineStyle.DETAILED,
  })
  @IsEnum(OutlineStyle)
  @IsOptional()
  outlineStyle?: OutlineStyle = OutlineStyle.DETAILED;

  @ApiProperty({
    description: 'Additional instructions for content generation',
    example: 'Focus on practical examples and include exercises',
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalInstructions?: string;
}

export class GenerateLessonResponseDto {
  @ApiProperty({
    description: 'AI suggested lesson title',
    example: 'Understanding Git Branching Strategies',
  })
  title: string;

  @ApiProperty({
    description: 'AI suggested slug derived from the title',
    example: 'understanding-git-branching-strategies',
  })
  slug: string;

  @ApiProperty({
    description: 'Short description summarizing the lesson',
    example: 'Learn how to create, switch, and merge branches in Git with practical commands and real-world workflows.',
  })
  description: string;

  @ApiProperty({
    description: 'Generated HTML content',
    example: '<h1>Git Branching</h1><p>This lesson covers...</p>',
  })
  html: string;

  @ApiProperty({
    description: 'Metadata about the generation process',
    example: {
      model: 'gemini-1.5-flash',
      tokens: 1500,
      citations: ['https://git-scm.com/docs/git-branch'],
    },
  })
  meta: {
    model: string;
    tokens: number;
    citations: string[];
    processingTime: number;
  };

  @ApiProperty({
    required: false,
    description: 'AI-suggested practice sessions for this lesson',
  })
  practices?: Array<{
    title: string;
    scenario: string;
    difficulty?: number;
    estimatedTime?: number;
    isActive?: boolean;
    order?: number;
    instructions?: Array<{ content: string; order?: number }>;
    hints?: Array<{ content: string; order?: number }>;
    expectedCommands?: Array<{ command: string; order?: number; isRequired?: boolean }>;
    validationRules?: Array<{ type: string; value: string; message?: string; order?: number }>;
    tags?: Array<{ name: string; color?: string }>;
    goalRepositoryState?: any;
  }>;
}
