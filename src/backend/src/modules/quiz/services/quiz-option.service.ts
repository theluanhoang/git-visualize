import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { QuizOption } from '../entities/quiz-option.entity';
import { CreateQuizOptionDTO } from '../dto/create-quiz.dto';

/**
 * Service responsible for QuizOption entity operations
 */
@Injectable()
export class QuizOptionService {
  constructor(
    @InjectRepository(QuizOption)
    private readonly quizOptionRepository: Repository<QuizOption>,
  ) {}

  /**
   * Create options for a question
   */
  async createMany(
    questionId: string,
    options: CreateQuizOptionDTO[],
    queryRunner?: QueryRunner,
  ): Promise<QuizOption[]> {
    const optionRepo = queryRunner
      ? queryRunner.manager.getRepository(QuizOption)
      : this.quizOptionRepository;

    const createdOptions = options.map((opt, index) =>
      optionRepo.create({
        questionId,
        text: opt.text,
        isCorrect: opt.isCorrect,
        order: opt.order !== undefined ? opt.order : index,
      }),
    );

    return optionRepo.save(createdOptions);
  }

  /**
   * Delete all options for a question
   */
  async deleteByQuestionId(
    questionId: string,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const optionRepo = queryRunner
      ? queryRunner.manager.getRepository(QuizOption)
      : this.quizOptionRepository;
    await optionRepo.softDelete({ questionId });
  }
}
