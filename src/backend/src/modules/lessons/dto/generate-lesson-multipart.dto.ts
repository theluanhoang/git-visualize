import { IsEnum, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SourceType, Language, ModelType, OutlineStyle } from './generate-lesson.dto';

export class GenerateLessonMultipartDto {
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

