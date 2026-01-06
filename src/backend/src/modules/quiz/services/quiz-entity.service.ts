import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { CreateQuizDTO } from '../dto/create-quiz.dto';
import { UpdateQuizDTO } from '../dto/update-quiz.dto';

/**
 * Service responsible for Quiz entity operations only
 * Single Responsibility: Manages Quiz CRUD operations
 */
@Injectable()
export class QuizEntityService {
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>
    ) {}

    /**
     * Create a new quiz entity
     */
    async create(
        createQuizDTO: CreateQuizDTO,
        queryRunner?: QueryRunner
    ): Promise<Quiz> {
        const quizRepo = queryRunner ? queryRunner.manager.getRepository(Quiz) : this.quizRepository;
        
        const quiz = quizRepo.create({
            lessonId: createQuizDTO.lessonId,
            title: createQuizDTO.title,
            description: createQuizDTO.description,
            difficulty: createQuizDTO.difficulty || 1,
            estimatedTime: createQuizDTO.estimatedTime || 0,
            isActive: createQuizDTO.isActive !== undefined ? createQuizDTO.isActive : true,
            order: createQuizDTO.order || 0,
            passingScore: createQuizDTO.passingScore || 70,
        });

        return quizRepo.save(quiz);
    }

    /**
     * Update an existing quiz entity
     */
    async update(
        id: string,
        updateQuizDTO: UpdateQuizDTO,
        queryRunner?: QueryRunner
    ): Promise<Quiz> {
        const quizRepo = queryRunner ? queryRunner.manager.getRepository(Quiz) : this.quizRepository;
        
        const quiz = await quizRepo.findOne({ where: { id } });
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        Object.assign(quiz, {
            title: updateQuizDTO.title,
            description: updateQuizDTO.description,
            difficulty: updateQuizDTO.difficulty,
            estimatedTime: updateQuizDTO.estimatedTime,
            isActive: updateQuizDTO.isActive,
            order: updateQuizDTO.order,
            passingScore: updateQuizDTO.passingScore,
        });

        return quizRepo.save(quiz);
    }

    /**
     * Find quiz by ID
     */
    async findById(id: string, queryRunner?: QueryRunner): Promise<Quiz | null> {
        const quizRepo = queryRunner ? queryRunner.manager.getRepository(Quiz) : this.quizRepository;
        return quizRepo.findOne({ where: { id } });
    }

    /**
     * Soft delete quiz
     */
    async softDelete(id: string, queryRunner?: QueryRunner): Promise<void> {
        const quizRepo = queryRunner ? queryRunner.manager.getRepository(Quiz) : this.quizRepository;
        const result = await quizRepo.softDelete({ id });
        if (!result.affected) {
            throw new Error('Quiz not found');
        }
    }

    /**
     * Increment view count
     */
    async incrementViews(id: string): Promise<void> {
        await this.quizRepository.increment({ id }, 'views', 1);
    }

    /**
     * Increment completion count
     */
    async incrementCompletions(id: string): Promise<void> {
        await this.quizRepository.increment({ id }, 'completions', 1);
    }
}
