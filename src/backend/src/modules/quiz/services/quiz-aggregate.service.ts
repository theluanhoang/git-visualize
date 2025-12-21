import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { CreateQuizDTO } from '../dto/create-quiz.dto';
import { UpdateQuizDTO } from '../dto/update-quiz.dto';
import { GetQuizzesQueryDto } from '../dto/get-quizzes.query.dto';
import { QuizEntityService } from './quiz-entity.service';
import { QuizQuestionService } from './quiz-question.service';
import { QuizOptionService } from './quiz-option.service';
import { QuizTagService } from './quiz-tag.service';

/**
 * Aggregate Service that orchestrates all Quiz-related operations
 */
@Injectable()
export class QuizAggregateService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly quizEntityService: QuizEntityService,
        private readonly quizQuestionService: QuizQuestionService,
        private readonly quizOptionService: QuizOptionService,
        private readonly quizTagService: QuizTagService
    ) {}

    async getQuizzes(query: GetQuizzesQueryDto): Promise<Quiz | { data: Quiz[]; total: number; limit: number; offset: number }> {
        const { 
            limit = 20, 
            offset = 0, 
            id,
            includeRelations = true 
        } = query;
        
        // Build query with filters
        const queryBuilder = this.buildQueryBuilder(query, includeRelations);

        // Single quiz by ID
        if (id) {
            const quiz = await queryBuilder.getOne();
            if (!quiz) {
                throw new NotFoundException('Quiz not found');
            }
            return quiz as Quiz;
        }

        // Pagination for multiple results
        queryBuilder.skip(offset).take(limit);
        const [quizzes, total] = await queryBuilder.getManyAndCount();

        return {
            data: quizzes as Quiz[],
            total,
            limit,
            offset
        };
    }

    async getQuizById(id: string): Promise<Quiz> {
        return this.getQuizzes({ id, includeRelations: true }) as Promise<Quiz>;
    }

    async getQuizzesByLessonSlug(lessonSlug: string): Promise<Quiz[]> {
        const result = await this.getQuizzes({ 
            lessonSlug, 
            isActive: true, 
            includeRelations: true 
        });
        
        if ('data' in result) {
            return result.data;
        }
        return [result as Quiz];
    }

    async createQuiz(createQuizDTO: CreateQuizDTO): Promise<Quiz> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create main quiz entity
            const savedQuiz = await this.quizEntityService.create(createQuizDTO, queryRunner);

            // Create related entities using transaction
            await this.createRelatedEntities(savedQuiz.id, createQuizDTO, queryRunner);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Return the created quiz with relations
            return this.getQuizById(savedQuiz.id);
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    async updateQuiz(id: string, updateQuizDTO: UpdateQuizDTO): Promise<Quiz> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if quiz exists
            const quiz = await this.quizEntityService.findById(id, queryRunner);
            if (!quiz) {
                throw new NotFoundException('Quiz not found');
            }

            // Update main quiz fields
            await this.quizEntityService.update(id, updateQuizDTO, queryRunner);

            // Update related entities using transaction
            await this.updateRelatedEntities(id, updateQuizDTO, queryRunner);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Return the updated quiz with relations
            return this.getQuizById(id);
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    async deleteQuiz(id: string): Promise<{ success: boolean }> {
        await this.quizEntityService.softDelete(id);
        return { success: true };
    }

    async incrementViews(id: string): Promise<void> {
        await this.quizEntityService.incrementViews(id);
    }

    async incrementCompletions(id: string): Promise<void> {
        await this.quizEntityService.incrementCompletions(id);
    }

    /**
     * Create related entities for a quiz
     */
    private async createRelatedEntities(
        quizId: string, 
        dto: CreateQuizDTO | UpdateQuizDTO,
        queryRunner?: QueryRunner
    ): Promise<void> {
        // Create questions and their options
        if (dto.questions?.length) {
            const questions = await this.quizQuestionService.createMany(quizId, dto.questions, queryRunner);
            
            // Create options for each question
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                const questionDTO = dto.questions[i];
                if (questionDTO.options?.length) {
                    await this.quizOptionService.createMany(question.id, questionDTO.options, queryRunner);
                }
            }
        }

        // Create tags
        if (dto.tags?.length) {
            await this.quizTagService.createMany(quizId, dto.tags, queryRunner);
        }
    }

    /**
     * Update related entities for a quiz
     */
    private async updateRelatedEntities(
        quizId: string, 
        dto: UpdateQuizDTO,
        queryRunner?: QueryRunner
    ): Promise<void> {
        // Update questions and their options
        if (dto.questions !== undefined) {
            // Delete existing questions (cascade will delete options)
            await this.quizQuestionService.deleteByQuizId(quizId, queryRunner);
            
            // Create new questions and options
            if (dto.questions.length > 0) {
                const questions = await this.quizQuestionService.createMany(quizId, dto.questions, queryRunner);
                
                // Create options for each question
                for (let i = 0; i < questions.length; i++) {
                    const question = questions[i];
                    const questionDTO = dto.questions[i];
                    if (questionDTO.options?.length) {
                        await this.quizOptionService.createMany(question.id, questionDTO.options, queryRunner);
                    }
                }
            }
        }

        // Update tags
        if (dto.tags !== undefined) {
            await this.quizTagService.updateMany(quizId, dto.tags, queryRunner);
        }
    }

    /**
     * Helper method to build query builder with filters
     */
    private buildQueryBuilder(query: GetQuizzesQueryDto, includeRelations: boolean) {
        const { id, lessonId, lessonSlug, isActive, q, difficulty, tag } = query;
        
        const queryBuilder = this.dataSource.createQueryBuilder(Quiz, 'quiz');

        // Add distinct to avoid duplicate rows from joins
        queryBuilder.distinct(true);

        // Add relations if needed
        if (includeRelations) {
            queryBuilder
                .leftJoinAndSelect('quiz.lesson', 'lesson')
                .leftJoinAndSelect('quiz.questions', 'questions')
                .leftJoinAndSelect('questions.options', 'options')
                .leftJoinAndSelect('quiz.tags', 'tags');
        } else {
            queryBuilder.leftJoin('quiz.lesson', 'lesson');
        }

        // Apply filters
        if (id) {
            queryBuilder.andWhere('quiz.id = :id', { id });
        }

        if (lessonId) {
            queryBuilder.andWhere('quiz.lessonId = :lessonId', { lessonId });
        }

        if (lessonSlug) {
            queryBuilder.andWhere('lesson.slug = :lessonSlug', { lessonSlug });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('quiz.isActive = :isActive', { isActive });
        }

        if (difficulty) {
            queryBuilder.andWhere('quiz.difficulty = :difficulty', { difficulty });
        }

        if (tag) {
            queryBuilder.andWhere('tags.name ILIKE :tag', { tag: `%${tag}%` });
        }

        if (q) {
            queryBuilder.andWhere(
                '(quiz.title ILIKE :q OR quiz.description ILIKE :q OR lesson.title ILIKE :q)',
                { q: `%${q}%` }
            );
        }

        // Ordering
        queryBuilder
            .orderBy('quiz.order', 'ASC')
            .addOrderBy('quiz.createdAt', 'DESC')
            .addOrderBy('questions.order', 'ASC')
            .addOrderBy('options.order', 'ASC');

        return queryBuilder;
    }
}
