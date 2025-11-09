import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { PracticeExpectedCommand } from '../entities/practice-expected-command.entity';
import { CreatePracticeExpectedCommandDTO } from '../dto/create-practice.dto';

/**
 * Service responsible for PracticeExpectedCommand entity operations only
 * Single Responsibility: Manages PracticeExpectedCommand CRUD operations
 */
@Injectable()
export class PracticeExpectedCommandService {
    constructor(
        @InjectRepository(PracticeExpectedCommand)
        private readonly expectedCommandRepository: Repository<PracticeExpectedCommand>
    ) {}

    /**
     * Create expected commands for a practice
     */
    async createExpectedCommands(
        practiceId: string,
        commands: CreatePracticeExpectedCommandDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeExpectedCommand[]> {
        const commandRepo = queryRunner ? queryRunner.manager.getRepository(PracticeExpectedCommand) : this.expectedCommandRepository;
        
        const commandEntities = commands.map((command, index) =>
            commandRepo.create({
                practiceId,
                command: command.command,
                order: command.order || index,
                isRequired: command.isRequired !== undefined ? command.isRequired : true
            })
        );

        return commandRepo.save(commandEntities);
    }

    /**
     * Update expected commands for a practice
     */
    async updateExpectedCommands(
        practiceId: string,
        commands: CreatePracticeExpectedCommandDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeExpectedCommand[]> {
        const commandRepo = queryRunner ? queryRunner.manager.getRepository(PracticeExpectedCommand) : this.expectedCommandRepository;
        
        await commandRepo.delete({ practiceId });

        if (commands.length > 0) {
            return this.createExpectedCommands(practiceId, commands, queryRunner);
        }

        return [];
    }

    /**
     * Delete all expected commands for a practice
     */
    async deleteExpectedCommands(practiceId: string, queryRunner?: QueryRunner): Promise<void> {
        const commandRepo = queryRunner ? queryRunner.manager.getRepository(PracticeExpectedCommand) : this.expectedCommandRepository;
        await commandRepo.delete({ practiceId });
    }
}
