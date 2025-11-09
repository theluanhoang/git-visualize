import { Module, forwardRef } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { LessonView } from './lesson-view.entity';
import { Rating } from './rating.entity';
import { PracticeModule } from '../practice/practice.module';
import { ContentExtractionService } from './services/content-extraction.service';
import { GeminiGenerationService } from './services/gemini-generation.service';
import { LessonGenerationService } from './services/lesson-generation.service';
import { LessonViewService } from './lesson-view.service';
import { RatingService } from './rating.service';
import { RatingGateway } from './rating.gateway';
import { SocketRateLimitService } from './services/socket-rate-limit.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, LessonView, Rating]),
    forwardRef(() => PracticeModule),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [LessonController],
  providers: [
    LessonService,
    LessonViewService,
    RatingService,
    RatingGateway,
    SocketRateLimitService,
    ContentExtractionService,
    GeminiGenerationService,
    LessonGenerationService,
  ],
  exports: [LessonService, LessonViewService, RatingService, RatingGateway]
})
export class LessonModule {}
