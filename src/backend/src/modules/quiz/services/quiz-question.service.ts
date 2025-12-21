import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { QuizQuestion, QuizQuestionType } from '../entities/quiz-question.entity';
import { CreateQuizQuestionDTO } from '../dto/create-quiz.dto';

/**
 * Service responsible for QuizQuestion entity operations
 */
@Injectable()
export class QuizQuestionService {
    constructor(
        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository: Repository<QuizQuestion>
    ) {}

    /**
     * Create questions for a quiz
     */
    async createMany(
        quizId: string,
        questions: CreateQuizQuestionDTO[],
        queryRunner?: QueryRunner
    ): Promise<QuizQuestion[]> {
        const questionRepo = queryRunner 
            ? queryRunner.manager.getRepository(QuizQuestion) 
            : this.quizQuestionRepository;

        const createdQuestions = questions.map((q, index) => 
            questionRepo.create({
                quizId,
                question: q.question,
                type: (q.type as QuizQuestionType) || QuizQuestionType.SINGLE_CHOICE,
                points: q.points || 1,
                order: q.order !== undefined ? q.order : index,
                explanation: q.explanation,
            })
        );

        return questionRepo.save(createdQuestions);
    }

    /**
     * Update questions for a quiz (delete old, create new)
     */
    async updateMany(
        quizId: string,
        questions: CreateQuizQuestionDTO[],
        queryRunner?: QueryRunner
    ): Promise<QuizQuestion[]> {
        const questionRepo = queryRunner 
            ? queryRunner.manager.getRepository(QuizQuestion) 
            : this.quizQuestionRepository;

        // Delete existing questions
        await questionRepo.softDelete({ quizId });

        // Create new questions
        return this.createMany(quizId, questions, queryRunner);
    }

    /**
     * Delete all questions for a quiz
     */
    async deleteByQuizId(quizId: string, queryRunner?: QueryRunner): Promise<void> {
        const questionRepo = queryRunner 
            ? queryRunner.manager.getRepository(QuizQuestion) 
            : this.quizQuestionRepository;
        await questionRepo.softDelete({ quizId });
    }
}
