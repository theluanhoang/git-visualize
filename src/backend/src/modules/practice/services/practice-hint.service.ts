import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { PracticeHint } from '../entities/practice-hint.entity';
import { CreatePracticeHintDTO } from '../dto/create-practice.dto';

/**
 * Service responsible for PracticeHint entity operations only
 * Single Responsibility: Manages PracticeHint CRUD operations
 */
@Injectable()
export class PracticeHintService {
    constructor(
        @InjectRepository(PracticeHint)
        private readonly hintRepository: Repository<PracticeHint>
    ) {}

    /**
     * Create hints for a practice
     */
    async createHints(
        practiceId: string,
        hints: CreatePracticeHintDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeHint[]> {
        const hintRepo = queryRunner ? queryRunner.manager.getRepository(PracticeHint) : this.hintRepository;
        
        const hintEntities = hints.map((hint, index) =>
            hintRepo.create({
                practiceId,
                content: hint.content,
                order: hint.order || index
            })
        );

        return hintRepo.save(hintEntities);
    }

    /**
     * Update hints for a practice
     */
    async updateHints(
        practiceId: string,
        hints: CreatePracticeHintDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeHint[]> {
        const hintRepo = queryRunner ? queryRunner.manager.getRepository(PracticeHint) : this.hintRepository;
        
        await hintRepo.delete({ practiceId });

        if (hints.length > 0) {
            return this.createHints(practiceId, hints, queryRunner);
        }

        return [];
    }

    /**
     * Delete all hints for a practice
     */
    async deleteHints(practiceId: string, queryRunner?: QueryRunner): Promise<void> {
        const hintRepo = queryRunner ? queryRunner.manager.getRepository(PracticeHint) : this.hintRepository;
        await hintRepo.delete({ practiceId });
    }
}
