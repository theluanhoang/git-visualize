import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePracticeDTO, CreatePracticeInstructionDTO, CreatePracticeHintDTO, CreatePracticeExpectedCommandDTO, CreatePracticeTagDTO } from './create-practice.dto';
import type { IRepositoryState } from '../../git-engine/git-engine.interface';

export class UpdatePracticeDTO extends PartialType(CreatePracticeDTO) {
    @ApiPropertyOptional({
        description: 'Update practice title',
        example: 'Updated Git Basics Practice'
    })
    title?: string;

    @ApiPropertyOptional({
        description: 'Update practice scenario',
        example: 'Updated scenario description'
    })
    scenario?: string;

    @ApiPropertyOptional({
        description: 'Update practice difficulty',
        example: 3,
        minimum: 1,
        maximum: 5
    })
    difficulty?: number;

    @ApiPropertyOptional({
        description: 'Update estimated time',
        example: 20,
        minimum: 0
    })
    estimatedTime?: number;

    @ApiPropertyOptional({
        description: 'Update active status',
        example: false
    })
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Update practice order',
        example: 2,
        minimum: 0
    })
    order?: number;

    @ApiPropertyOptional({
        description: 'Update practice version',
        example: 2,
        minimum: 1
    })
    version?: number;

    @ApiPropertyOptional({
        description: 'Update step-by-step instructions',
        type: [CreatePracticeInstructionDTO]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeInstructionDTO)
    instructions?: CreatePracticeInstructionDTO[];

    @ApiPropertyOptional({
        description: 'Update helpful hints',
        type: [CreatePracticeHintDTO]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeHintDTO)
    hints?: CreatePracticeHintDTO[];

    @ApiPropertyOptional({
        description: 'Update expected commands',
        type: [CreatePracticeExpectedCommandDTO]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeExpectedCommandDTO)
    expectedCommands?: CreatePracticeExpectedCommandDTO[];

    @ApiPropertyOptional({
        description: 'Update tags',
        type: [CreatePracticeTagDTO]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePracticeTagDTO)
    tags?: CreatePracticeTagDTO[];

    @ApiPropertyOptional({
        description: 'Update goal repository state',
        example: { commits: [], branches: [], tags: [], head: null }
    })
    @IsOptional()
    goalRepositoryState?: IRepositoryState;
}
