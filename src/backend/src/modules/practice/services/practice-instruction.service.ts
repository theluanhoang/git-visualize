import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { PracticeInstruction } from '../entities/practice-instruction.entity';
import { CreatePracticeInstructionDTO } from '../dto/create-practice.dto';

/**
 * Service responsible for PracticeInstruction entity operations only
 * Single Responsibility: Manages PracticeInstruction CRUD operations
 */
@Injectable()
export class PracticeInstructionService {
    constructor(
        @InjectRepository(PracticeInstruction)
        private readonly instructionRepository: Repository<PracticeInstruction>
    ) {}

    /**
     * Create instructions for a practice
     */
    async createInstructions(
        practiceId: string,
        instructions: CreatePracticeInstructionDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeInstruction[]> {
        const instructionRepo = queryRunner ? queryRunner.manager.getRepository(PracticeInstruction) : this.instructionRepository;
        
        const instructionEntities = instructions.map((instruction, index) =>
            instructionRepo.create({
                practiceId,
                content: instruction.content,
                order: instruction.order || index
            })
        );

        return instructionRepo.save(instructionEntities);
    }

    /**
     * Update instructions for a practice
     */
    async updateInstructions(
        practiceId: string,
        instructions: CreatePracticeInstructionDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeInstruction[]> {
        const instructionRepo = queryRunner ? queryRunner.manager.getRepository(PracticeInstruction) : this.instructionRepository;
        
        await instructionRepo.delete({ practiceId });

        if (instructions.length > 0) {
            return this.createInstructions(practiceId, instructions, queryRunner);
        }

        return [];
    }

    /**
     * Delete all instructions for a practice
     */
    async deleteInstructions(practiceId: string, queryRunner?: QueryRunner): Promise<void> {
        const instructionRepo = queryRunner ? queryRunner.manager.getRepository(PracticeInstruction) : this.instructionRepository;
        await instructionRepo.delete({ practiceId });
    }
}
