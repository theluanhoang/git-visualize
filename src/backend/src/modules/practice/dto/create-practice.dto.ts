import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { IRepositoryState } from '../../git-engine/git-engine.interface';

export class CreatePracticeInstructionDTO {
    @ApiProperty({
        description: 'Instruction content',
        example: 'Initialize a new Git repository'
    })
    @IsString()
    content: string;

    @ApiPropertyOptional({
        description: 'Order of instruction',
        example: 1,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    order?: number;
}

export class CreatePracticeHintDTO {
    @ApiProperty({
        description: 'Hint content',
        example: 'Use git init command to initialize repository'
    })
    @IsString()
    content: string;

    @ApiPropertyOptional({
        description: 'Order of hint',
        example: 1,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    order?: number;
}

export class CreatePracticeExpectedCommandDTO {
    @ApiProperty({
        description: 'Expected command',
        example: 'git init'
    })
    @IsString()
    command: string;

    @ApiPropertyOptional({
        description: 'Order of command',
        example: 1,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    order?: number;

    @ApiPropertyOptional({
        description: 'Whether command is required',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;
}

export class CreatePracticeValidationRuleDTO {
    @ApiProperty({
        description: 'Validation rule type',
        example: 'min_commands',
        enum: ['min_commands', 'max_commands', 'required_commands', 'branch_count', 'commit_count']
    })
    @IsString()
    type: string;

    @ApiProperty({
        description: 'Validation rule value',
        example: '2'
    })
    @IsString()
    value: string;

    @ApiPropertyOptional({
        description: 'Validation error message',
        example: 'At least 2 commands are required'
    })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional({
        description: 'Order of validation rule',
        example: 1,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    order?: number;
}

export class CreatePracticeTagDTO {
    @ApiProperty({
        description: 'Tag name',
        example: 'beginner'
    })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'Tag color (hex code)',
        example: '#FF5733'
    })
    @IsOptional()
    @IsString()
    color?: string;
}

export class CreatePracticeDTO {
    @ApiProperty({
        description: 'Lesson ID that this practice belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsString()
    lessonId: string;

    @ApiProperty({
        description: 'Practice title',
        example: 'Git Basics Practice'
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Practice scenario description',
        example: 'Create a new repository and make your first commit'
    })
    @IsString()
    scenario: string;

    @ApiPropertyOptional({
        description: 'Practice difficulty level (1-5)',
        example: 2,
        minimum: 1,
        maximum: 5,
        default: 1
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    difficulty?: number;

    @ApiPropertyOptional({
        description: 'Estimated time to complete in minutes',
        example: 15,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedTime?: number;

    @ApiPropertyOptional({
        description: 'Whether practice is active',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Practice order for display',
        example: 1,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    order?: number;

    @ApiPropertyOptional({
        description: 'Version of the practice data schema/content',
        example: 1,
        minimum: 1,
        default: 1
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    version?: number;

    @ApiPropertyOptional({
        description: 'Step-by-step instructions',
        type: [CreatePracticeInstructionDTO],
        example: [
            { content: 'Initialize a new Git repository', order: 1 },
            { content: 'Add files to staging area', order: 2 }
        ]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeInstructionDTO)
    instructions?: CreatePracticeInstructionDTO[];

    @ApiPropertyOptional({
        description: 'Helpful hints for the practice',
        type: [CreatePracticeHintDTO],
        example: [
            { content: 'Use git init command', order: 1 }
        ]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeHintDTO)
    hints?: CreatePracticeHintDTO[];

    @ApiPropertyOptional({
        description: 'Expected commands from user',
        type: [CreatePracticeExpectedCommandDTO],
        example: [
            { command: 'git init', order: 1, isRequired: true },
            { command: 'git add .', order: 2, isRequired: true }
        ]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeExpectedCommandDTO)
    expectedCommands?: CreatePracticeExpectedCommandDTO[];

    @ApiPropertyOptional({
        description: 'Validation rules for the practice',
        type: [CreatePracticeValidationRuleDTO],
        example: [
            { type: 'min_commands', value: '2', message: 'At least 2 commands required' }
        ]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeValidationRuleDTO)
    validationRules?: CreatePracticeValidationRuleDTO[];

    @ApiPropertyOptional({
        description: 'Tags for categorizing the practice',
        type: [CreatePracticeTagDTO],
        example: [
            { name: 'beginner', color: '#FF5733' },
            { name: 'git-basics', color: '#33FF57' }
        ]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeTagDTO)
    tags?: CreatePracticeTagDTO[];

    @ApiPropertyOptional({
        description: 'Goal repository state for visualization',
        example: { commits: [], branches: [], tags: [], head: null }
    })
    @IsOptional()
    goalRepositoryState?: IRepositoryState;
}
