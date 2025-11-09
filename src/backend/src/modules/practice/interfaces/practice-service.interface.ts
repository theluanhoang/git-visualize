import { QueryRunner } from 'typeorm';
import { Practice } from '../entities/practice.entity';
import { CreatePracticeDTO } from '../dto/create-practice.dto';
import { UpdatePracticeDTO } from '../dto/update-practice.dto';
import { GetPracticesQueryDto } from '../dto/get-practices.query.dto';

/**
 * Interface for Practice Service
 * Open/Closed Principle: Open for extension, closed for modification
 */
export interface IPracticeService {
    /**
     * Get practices with flexible filtering
     */
    getPractices(query: GetPracticesQueryDto): Promise<Practice | { data: Practice[]; total: number; limit: number; offset: number }>;

    /**
     * Get practice by ID
     */
    getPracticeById(id: string): Promise<Practice>;

    /**
     * Get practices by lesson slug
     */
    getPracticesByLessonSlug(lessonSlug: string): Promise<Practice[]>;

    /**
     * Create a new practice
     */
    createPractice(createPracticeDTO: CreatePracticeDTO): Promise<Practice>;

    /**
     * Update an existing practice
     */
    updatePractice(id: string, updatePracticeDTO: UpdatePracticeDTO): Promise<Practice>;

    /**
     * Delete a practice
     */
    deletePractice(id: string): Promise<{ success: boolean }>;

    /**
     * Increment views count
     */
    incrementViews(id: string): Promise<void>;

    /**
     * Increment completions count
     */
    incrementCompletions(id: string): Promise<void>;
}

/**
 * Interface for Practice Entity Service
 */
export interface IPracticeEntityService {
    create(createPracticeDTO: CreatePracticeDTO, queryRunner?: QueryRunner): Promise<Practice>;
    update(id: string, updatePracticeDTO: UpdatePracticeDTO, queryRunner?: QueryRunner): Promise<Practice>;
    findById(id: string, queryRunner?: QueryRunner): Promise<Practice | null>;
    softDelete(id: string, queryRunner?: QueryRunner): Promise<void>;
    incrementViews(id: string): Promise<void>;
    incrementCompletions(id: string): Promise<void>;
}

/**
 * Interface for Practice Instruction Service
 */
export interface IPracticeInstructionService {
    createInstructions(practiceId: string, instructions: any[], queryRunner?: QueryRunner): Promise<any[]>;
    updateInstructions(practiceId: string, instructions: any[], queryRunner?: QueryRunner): Promise<any[]>;
    deleteInstructions(practiceId: string, queryRunner?: QueryRunner): Promise<void>;
}

/**
 * Interface for Practice Hint Service
 */
export interface IPracticeHintService {
    createHints(practiceId: string, hints: any[], queryRunner?: QueryRunner): Promise<any[]>;
    updateHints(practiceId: string, hints: any[], queryRunner?: QueryRunner): Promise<any[]>;
    deleteHints(practiceId: string, queryRunner?: QueryRunner): Promise<void>;
}

/**
 * Interface for Practice Expected Command Service
 */
export interface IPracticeExpectedCommandService {
    createExpectedCommands(practiceId: string, commands: any[], queryRunner?: QueryRunner): Promise<any[]>;
    updateExpectedCommands(practiceId: string, commands: any[], queryRunner?: QueryRunner): Promise<any[]>;
    deleteExpectedCommands(practiceId: string, queryRunner?: QueryRunner): Promise<void>;
}

/**
 * Interface for Practice Validation Rule Service
 */
export interface IPracticeValidationRuleService {
    createValidationRules(practiceId: string, rules: any[], queryRunner?: QueryRunner): Promise<any[]>;
    updateValidationRules(practiceId: string, rules: any[], queryRunner?: QueryRunner): Promise<any[]>;
    deleteValidationRules(practiceId: string, queryRunner?: QueryRunner): Promise<void>;
}

/**
 * Interface for Practice Tag Service
 */
export interface IPracticeTagService {
    createTags(practiceId: string, tags: any[], queryRunner?: QueryRunner): Promise<any[]>;
    updateTags(practiceId: string, tags: any[], queryRunner?: QueryRunner): Promise<any[]>;
    deleteTags(practiceId: string, queryRunner?: QueryRunner): Promise<void>;
}
