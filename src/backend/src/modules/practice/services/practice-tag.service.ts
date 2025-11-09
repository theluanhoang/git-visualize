import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { PracticeTag } from '../entities/practice-tag.entity';
import { CreatePracticeTagDTO } from '../dto/create-practice.dto';

/**
 * Service responsible for PracticeTag entity operations only
 * Single Responsibility: Manages PracticeTag CRUD operations
 */
@Injectable()
export class PracticeTagService {
    constructor(
        @InjectRepository(PracticeTag)
        private readonly tagRepository: Repository<PracticeTag>
    ) {}

    /**
     * Create tags for a practice
     */
    async createTags(
        practiceId: string,
        tags: CreatePracticeTagDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeTag[]> {
        const tagRepo = queryRunner ? queryRunner.manager.getRepository(PracticeTag) : this.tagRepository;
        
        const tagEntities = tags.map(tag =>
            tagRepo.create({
                practiceId,
                name: tag.name,
                color: tag.color
            })
        );

        return tagRepo.save(tagEntities);
    }

    /**
     * Update tags for a practice
     */
    async updateTags(
        practiceId: string,
        tags: CreatePracticeTagDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeTag[]> {
        const tagRepo = queryRunner ? queryRunner.manager.getRepository(PracticeTag) : this.tagRepository;
        
        await tagRepo.delete({ practiceId });

        if (tags.length > 0) {
            return this.createTags(practiceId, tags, queryRunner);
        }

        return [];
    }

    /**
     * Delete all tags for a practice
     */
    async deleteTags(practiceId: string, queryRunner?: QueryRunner): Promise<void> {
        const tagRepo = queryRunner ? queryRunner.manager.getRepository(PracticeTag) : this.tagRepository;
        await tagRepo.delete({ practiceId });
    }
}
