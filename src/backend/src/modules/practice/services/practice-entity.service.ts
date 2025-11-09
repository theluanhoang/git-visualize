import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Practice } from '../entities/practice.entity';
import { CreatePracticeDTO } from '../dto/create-practice.dto';
import { UpdatePracticeDTO } from '../dto/update-practice.dto';

/**
 * Service responsible for Practice entity operations only
 * Single Responsibility: Manages Practice CRUD operations
 */
@Injectable()
export class PracticeEntityService {
    constructor(
        @InjectRepository(Practice)
        private readonly practiceRepository: Repository<Practice>
    ) {}

    /**
     * Create a new practice entity
     */
    async create(
        createPracticeDTO: CreatePracticeDTO,
        queryRunner?: QueryRunner
    ): Promise<Practice> {
        const practiceRepo = queryRunner ? queryRunner.manager.getRepository(Practice) : this.practiceRepository;
        
        const practice = practiceRepo.create({
            lessonId: createPracticeDTO.lessonId,
            title: createPracticeDTO.title,
            scenario: createPracticeDTO.scenario,
            difficulty: createPracticeDTO.difficulty || 1,
            estimatedTime: createPracticeDTO.estimatedTime || 0,
            isActive: createPracticeDTO.isActive !== undefined ? createPracticeDTO.isActive : true,
            order: createPracticeDTO.order || 0,
            version: createPracticeDTO.version || 1,
            goalRepositoryState: createPracticeDTO.goalRepositoryState
        });

        return practiceRepo.save(practice);
    }

    /**
     * Update an existing practice entity
     */
    async update(
        id: string,
        updatePracticeDTO: UpdatePracticeDTO,
        queryRunner?: QueryRunner
    ): Promise<Practice> {
        const practiceRepo = queryRunner ? queryRunner.manager.getRepository(Practice) : this.practiceRepository;
        
        const practice = await practiceRepo.findOne({ where: { id } });
        if (!practice) {
            throw new Error('Practice not found');
        }

        const shouldIncrementVersion = updatePracticeDTO.version === undefined;
        const newVersion = shouldIncrementVersion ? practice.version + 1 : updatePracticeDTO.version;

        Object.assign(practice, {
            title: updatePracticeDTO.title,
            scenario: updatePracticeDTO.scenario,
            difficulty: updatePracticeDTO.difficulty,
            estimatedTime: updatePracticeDTO.estimatedTime,
            isActive: updatePracticeDTO.isActive,
            order: updatePracticeDTO.order,
            version: newVersion,
            goalRepositoryState: updatePracticeDTO.goalRepositoryState
        });

        return practiceRepo.save(practice);
    }

    /**
     * Find practice by ID
     */
    async findById(id: string, queryRunner?: QueryRunner): Promise<Practice | null> {
        const practiceRepo = queryRunner ? queryRunner.manager.getRepository(Practice) : this.practiceRepository;
        return practiceRepo.findOne({ where: { id } });
    }

    /**
     * Soft delete practice
     */
    async softDelete(id: string, queryRunner?: QueryRunner): Promise<void> {
        const practiceRepo = queryRunner ? queryRunner.manager.getRepository(Practice) : this.practiceRepository;
        const result = await practiceRepo.softDelete({ id });
        if (!result.affected) {
            throw new Error('Practice not found');
        }
    }

    /**
     * Increment views count
     */
    async incrementViews(id: string): Promise<void> {
        await this.practiceRepository.increment({ id }, 'views', 1);
    }

    /**
     * Increment completions count
     */
    async incrementCompletions(id: string): Promise<void> {
        await this.practiceRepository.increment({ id }, 'completions', 1);
    }

    async countForPublishedLessons(): Promise<number> {
        const row = await this.practiceRepository.manager
            .createQueryBuilder()
            .from('practice', 'practice')
            .innerJoin('lesson', 'lesson', 'lesson.id = practice."lessonId"')
            .where('lesson.status = :status', { status: 'PUBLISHED' })
            .select('COUNT(practice.id)', 'count')
            .getRawOne<{ count: string }>();

        return Number(row?.count ?? 0);
    }
    
    async getAggregateStats(): Promise<{
        totalTimeSpent: { totalMinutes: number };
        completionStats: { totalCompletions: number; totalViews: number };
    }> {
        const [totalTimeSpent, completionStats] = await Promise.all([
            this.practiceRepository
                .createQueryBuilder('practice')
                .select('SUM(practice.estimatedTime * practice.completions)', 'totalMinutes')
                .where('practice.completions > 0')
                .getRawOne<{ totalMinutes: string | null }>(),
            this.practiceRepository
                .createQueryBuilder('practice')
                .select('SUM(practice.completions)', 'totalCompletions')
                .addSelect('SUM(practice.views)', 'totalViews')
                .where('practice.views > 0')
                .getRawOne<{ totalCompletions: string | null; totalViews: string | null }>(),
        ]);

        return {
            totalTimeSpent: {
                totalMinutes: totalTimeSpent?.totalMinutes ? parseFloat(totalTimeSpent.totalMinutes) : 0,
            },
            completionStats: {
                totalCompletions: completionStats?.totalCompletions ? parseFloat(completionStats.totalCompletions) : 0,
                totalViews: completionStats?.totalViews ? parseFloat(completionStats.totalViews) : 0,
            },
        };
    }
}
