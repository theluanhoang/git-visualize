import { Injectable, BadRequestException } from '@nestjs/common';
import { ContentExtractionService, ExtractedContent } from './content-extraction.service';
import { GeminiGenerationService, GenerationResult } from './gemini-generation.service';
import { GenerateLessonDto, Language, ModelType, OutlineStyle, SourceType } from '../dto/generate-lesson.dto';

@Injectable()
export class LessonGenerationService {
  constructor(
    private readonly contentExtractionService: ContentExtractionService,
    private readonly geminiGenerationService: GeminiGenerationService,
  ) {}

  async generateLesson(
    dto: GenerateLessonDto & {
      fileBuffer?: Buffer;
      fileName?: string;
    }
  ): Promise<GenerationResult> {
    try {
      let extractedContent: ExtractedContent;

      switch (dto.sourceType) {
        case SourceType.URL:
          if (!dto.url) {
            throw new BadRequestException('URL is required when sourceType is url');
          }
          extractedContent = await this.contentExtractionService.extractFromUrl(dto.url);
          break;

        case SourceType.FILE:
          if (!dto.fileBuffer || !dto.fileName) {
            throw new BadRequestException('fileBuffer and fileName are required when sourceType is file');
          }
          if (dto.fileName.toLowerCase().endsWith('.pdf')) {
            extractedContent = await this.contentExtractionService.extractFromPdf(dto.fileBuffer);
          } else if (dto.fileName.toLowerCase().endsWith('.docx')) {
            extractedContent = await this.contentExtractionService.extractFromDocx(dto.fileBuffer);
          } else {
            throw new BadRequestException('Unsupported file type. Only PDF and DOCX files are supported.');
          }
          break;

        default:
          throw new BadRequestException('Invalid source type');
      }

      const result = await this.geminiGenerationService.generateLesson(
        extractedContent,
        dto.language || Language.VI,
        dto.model || ModelType.GEMINI_FLASH,
        dto.outlineStyle || OutlineStyle.DETAILED,
        dto.additionalInstructions,
      );

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to generate lesson: ${error.message}`);
    }
  }
}
