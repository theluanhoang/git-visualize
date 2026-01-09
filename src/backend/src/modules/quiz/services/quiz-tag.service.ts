import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { QuizTag } from '../entities/quiz-tag.entity';
import { CreateQuizTagDTO } from '../dto/create-quiz.dto';

/**
 * Service responsible for QuizTag entity operations
 */
@Injectable()
export class QuizTagService {
  constructor(
    @InjectRepository(QuizTag)
    private readonly quizTagRepository: Repository<QuizTag>,
  ) {}

  /**
   * Create tags for a quiz
   */
  async createMany(
    quizId: string,
    tags: CreateQuizTagDTO[],
    queryRunner?: QueryRunner,
  ): Promise<QuizTag[]> {
    const tagRepo = queryRunner
      ? queryRunner.manager.getRepository(QuizTag)
      : this.quizTagRepository;

    const createdTags = tags.map((tag) =>
      tagRepo.create({
        quizId,
        name: tag.name,
        color: tag.color,
      }),
    );

    return tagRepo.save(createdTags);
  }

  /**
   * Update tags for a quiz (delete old, create new)
   */
  async updateMany(
    quizId: string,
    tags: CreateQuizTagDTO[],
    queryRunner?: QueryRunner,
  ): Promise<QuizTag[]> {
    const tagRepo = queryRunner
      ? queryRunner.manager.getRepository(QuizTag)
      : this.quizTagRepository;

    // Delete existing tags
    await tagRepo.softDelete({ quizId });

    // Create new tags
    return this.createMany(quizId, tags, queryRunner);
  }

  /**
   * Delete all tags for a quiz
   */
  async deleteByQuizId(
    quizId: string,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const tagRepo = queryRunner
      ? queryRunner.manager.getRepository(QuizTag)
      : this.quizTagRepository;
    await tagRepo.softDelete({ quizId });
  }
}
