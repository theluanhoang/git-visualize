import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizOption } from './entities/quiz-option.entity';
import { QuizTag } from './entities/quiz-tag.entity';
import { QuizController } from './quiz.controller';
import { QuizAggregateService } from './services/quiz-aggregate.service';
import { QuizEntityService } from './services/quiz-entity.service';
import { QuizQuestionService } from './services/quiz-question.service';
import { QuizOptionService } from './services/quiz-option.service';
import { QuizTagService } from './services/quiz-tag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      QuizQuestion,
      QuizOption,
      QuizTag,
    ])
  ],
  controllers: [QuizController],
  providers: [
    QuizAggregateService,
    QuizEntityService,
    QuizQuestionService,
    QuizOptionService,
    QuizTagService,
  ],
  exports: [
    QuizAggregateService,
    QuizEntityService,
  ],
})
export class QuizModule {}
