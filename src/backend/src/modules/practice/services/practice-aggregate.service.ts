import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Practice } from '../entities/practice.entity';
import { CreatePracticeDTO } from '../dto/create-practice.dto';
import { UpdatePracticeDTO } from '../dto/update-practice.dto';
import { GetPracticesQueryDto } from '../dto/get-practices.query.dto';
import { IPracticeService } from '../interfaces/practice-service.interface';
import { PracticeEntityService } from './practice-entity.service';
import { PracticeInstructionService } from './practice-instruction.service';
import { PracticeHintService } from './practice-hint.service';
import { PracticeExpectedCommandService } from './practice-expected-command.service';
import { PracticeValidationRuleService } from './practice-validation-rule.service';
import { PracticeTagService } from './practice-tag.service';

/**
 * Aggregate Service that orchestrates all Practice-related operations
 * Dependency Inversion Principle: Depends on abstractions, not concretions
 */
@Injectable()
export class PracticeAggregateService implements IPracticeService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly practiceEntityService: PracticeEntityService,
        private readonly practiceInstructionService: PracticeInstructionService,
        private readonly practiceHintService: PracticeHintService,
        private readonly practiceExpectedCommandService: PracticeExpectedCommandService,
        private readonly practiceValidationRuleService: PracticeValidationRuleService,
        private readonly practiceTagService: PracticeTagService
    ) {}

    async getPractices(query: GetPracticesQueryDto): Promise<Practice | { data: Practice[]; total: number; limit: number; offset: number }> {
        const { 
            limit = 20, 
            offset = 0, 
            id,
            includeRelations = true 
        } = query;
        
        // Build query with filters
        const queryBuilder = this.buildQueryBuilder(query, includeRelations);

        // Single practice by ID
        if (id) {
            const practice = await queryBuilder.getOne();
            if (!practice) {
                throw new NotFoundException('Practice not found');
            }
            return practice as Practice;
        }

        // Pagination for multiple results
        queryBuilder.skip(offset).take(limit);
        const [practices, total] = await queryBuilder.getManyAndCount();

        return {
            data: practices as Practice[],
            total,
            limit,
            offset
        };
    }

    async getPracticeById(id: string): Promise<Practice> {
        return this.getPractices({ id, includeRelations: true }) as Promise<Practice>;
    }

    async getPracticesByLessonSlug(lessonSlug: string): Promise<Practice[]> {
        const result = await this.getPractices({ 
            lessonSlug, 
            isActive: true, 
            includeRelations: true 
        });
        
        if ('data' in result) {
            return result.data;
        }
        return [result as Practice];
    }

    async createPractice(createPracticeDTO: CreatePracticeDTO): Promise<Practice> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create main practice entity
            const savedPractice = await this.practiceEntityService.create(createPracticeDTO, queryRunner);

            // Create related entities using transaction
            await this.createRelatedEntities(savedPractice.id, createPracticeDTO, queryRunner);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Return the created practice with relations
            return this.getPracticeById(savedPractice.id);
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    async updatePractice(id: string, updatePracticeDTO: UpdatePracticeDTO): Promise<Practice> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if practice exists
            const practice = await this.practiceEntityService.findById(id, queryRunner);
            if (!practice) {
                throw new NotFoundException('Practice not found');
            }

            // Update main practice fields
            await this.practiceEntityService.update(id, updatePracticeDTO, queryRunner);

            // Update related entities using transaction
            await this.updateRelatedEntities(id, updatePracticeDTO, queryRunner);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Return the updated practice with relations
            return this.getPracticeById(id);
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    }

    async deletePractice(id: string): Promise<{ success: boolean }> {
        await this.practiceEntityService.softDelete(id);
        return { success: true };
    }

    async incrementViews(id: string): Promise<void> {
        await this.practiceEntityService.incrementViews(id);
    }

    async incrementCompletions(id: string): Promise<void> {
        await this.practiceEntityService.incrementCompletions(id);
    }

    /**
     * Create related entities for a practice
     * Dependency Inversion: Uses interface methods
     */
    private async createRelatedEntities(
        practiceId: string, 
        dto: CreatePracticeDTO | UpdatePracticeDTO,
        queryRunner?: QueryRunner
    ): Promise<void> {
        const promises: Promise<any>[] = [];

        // Create instructions
        if (dto.instructions?.length) {
            promises.push(this.practiceInstructionService.createInstructions(practiceId, dto.instructions, queryRunner));
        }

        // Create hints
        if (dto.hints?.length) {
            promises.push(this.practiceHintService.createHints(practiceId, dto.hints, queryRunner));
        }

        // Create expected commands
        if (dto.expectedCommands?.length) {
            promises.push(this.practiceExpectedCommandService.createExpectedCommands(practiceId, dto.expectedCommands, queryRunner));
        }

        // Create validation rules
        if (dto.validationRules?.length) {
            promises.push(this.practiceValidationRuleService.createValidationRules(practiceId, dto.validationRules, queryRunner));
        }

        // Create tags
        if (dto.tags?.length) {
            promises.push(this.practiceTagService.createTags(practiceId, dto.tags, queryRunner));
        }

        // Execute all operations in parallel
        await Promise.all(promises);
    }

    /**
     * Update related entities for a practice
     * Dependency Inversion: Uses interface methods
     */
    private async updateRelatedEntities(
        practiceId: string, 
        dto: UpdatePracticeDTO,
        queryRunner?: QueryRunner
    ): Promise<void> {
        const promises: Promise<any>[] = [];

        // Update instructions
        if (dto.instructions !== undefined) {
            promises.push(this.practiceInstructionService.updateInstructions(practiceId, dto.instructions, queryRunner));
        }

        // Update hints
        if (dto.hints !== undefined) {
            promises.push(this.practiceHintService.updateHints(practiceId, dto.hints, queryRunner));
        }

        // Update expected commands
        if (dto.expectedCommands !== undefined) {
            promises.push(this.practiceExpectedCommandService.updateExpectedCommands(practiceId, dto.expectedCommands, queryRunner));
        }

        // Update validation rules
        if (dto.validationRules !== undefined) {
            promises.push(this.practiceValidationRuleService.updateValidationRules(practiceId, dto.validationRules, queryRunner));
        }

        // Update tags
        if (dto.tags !== undefined) {
            promises.push(this.practiceTagService.updateTags(practiceId, dto.tags, queryRunner));
        }

        // Execute all operations in parallel
        await Promise.all(promises);
    }

    /**
     * Helper method to build query builder with filters
     */
    private buildQueryBuilder(query: GetPracticesQueryDto, includeRelations: boolean) {
        const { id, lessonId, lessonSlug, isActive, q, difficulty, tag, publishedOnly = true } = query;
        
        const queryBuilder = this.dataSource.createQueryBuilder(Practice, 'practice');

        // Add distinct to avoid duplicate rows from joins
        queryBuilder.distinct(true);

        // Add relations if needed
        if (includeRelations) {
            queryBuilder
                .leftJoinAndSelect('practice.lesson', 'lesson')
                .leftJoinAndSelect('practice.instructions', 'instructions')
                .leftJoinAndSelect('practice.hints', 'hints')
                .leftJoinAndSelect('practice.expectedCommands', 'expectedCommands')
                .leftJoinAndSelect('practice.validationRules', 'validationRules')
                .leftJoinAndSelect('practice.tags', 'tags');
        } else {
            queryBuilder.leftJoin('practice.lesson', 'lesson');
        }

        // Apply filters
        if (id) {
            queryBuilder.andWhere('practice.id = :id', { id });
        }

        if (lessonId) {
            queryBuilder.andWhere('practice.lessonId = :lessonId', { lessonId });
        }

        if (lessonSlug) {
            queryBuilder.andWhere('lesson.slug = :lessonSlug', { lessonSlug });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('practice.isActive = :isActive', { isActive });
        }

        if (difficulty) {
            queryBuilder.andWhere('practice.difficulty = :difficulty', { difficulty });
        }

        if (tag) {
            queryBuilder.andWhere('tags.name ILIKE :tag', { tag: `%${tag}%` });
        }

        if (q) {
            queryBuilder.andWhere(
                '(practice.title ILIKE :q OR practice.scenario ILIKE :q OR lesson.title ILIKE :q)',
                { q: `%${q}%` }
            );
        }

        if (publishedOnly !== false) {
            queryBuilder.andWhere('lesson.status = :publishedStatus', { publishedStatus: 'PUBLISHED' });
        }

        // Ordering
        queryBuilder
            .orderBy('practice.order', 'ASC')
            .addOrderBy('practice.createdAt', 'DESC');

        return queryBuilder;
    }
}
