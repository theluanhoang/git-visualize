import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { PracticeValidationRule, ValidationRuleType } from '../entities/practice-validation-rule.entity';
import { CreatePracticeValidationRuleDTO } from '../dto/create-practice.dto';

/**
 * Service responsible for PracticeValidationRule entity operations only
 * Single Responsibility: Manages PracticeValidationRule CRUD operations
 */
@Injectable()
export class PracticeValidationRuleService {
    constructor(
        @InjectRepository(PracticeValidationRule)
        private readonly validationRuleRepository: Repository<PracticeValidationRule>
    ) {}

    /**
     * Create validation rules for a practice
     */
    async createValidationRules(
        practiceId: string,
        rules: CreatePracticeValidationRuleDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeValidationRule[]> {
        const ruleRepo = queryRunner ? queryRunner.manager.getRepository(PracticeValidationRule) : this.validationRuleRepository;
        
        const ruleEntities = rules.map((rule, index) =>
            ruleRepo.create({
                practiceId,
                type: rule.type as ValidationRuleType,
                value: rule.value,
                message: rule.message,
                order: rule.order || index
            })
        );

        return ruleRepo.save(ruleEntities);
    }

    /**
     * Update validation rules for a practice
     */
    async updateValidationRules(
        practiceId: string,
        rules: CreatePracticeValidationRuleDTO[],
        queryRunner?: QueryRunner
    ): Promise<PracticeValidationRule[]> {
        const ruleRepo = queryRunner ? queryRunner.manager.getRepository(PracticeValidationRule) : this.validationRuleRepository;
        
        await ruleRepo.delete({ practiceId });

        if (rules.length > 0) {
            return this.createValidationRules(practiceId, rules, queryRunner);
        }

        return [];
    }

    /**
     * Delete all validation rules for a practice
     */
    async deleteValidationRules(practiceId: string, queryRunner?: QueryRunner): Promise<void> {
        const ruleRepo = queryRunner ? queryRunner.manager.getRepository(PracticeValidationRule) : this.validationRuleRepository;
        await ruleRepo.delete({ practiceId });
    }
}
