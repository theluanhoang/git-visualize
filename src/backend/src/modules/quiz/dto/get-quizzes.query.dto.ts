import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetQuizzesQueryDto {
    @ApiPropertyOptional({
        description: 'Get quiz by ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional({
        description: 'Filter by lesson ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsString()
    lessonId?: string;

    @ApiPropertyOptional({
        description: 'Filter by lesson slug',
        example: 'gioi-thieu-ve-git'
    })
    @IsOptional()
    @IsString()
    lessonSlug?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by difficulty (1-5)',
        example: 2,
        minimum: 1,
        maximum: 5
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    difficulty?: number;

    @ApiPropertyOptional({
        description: 'Search in title and description',
        example: 'git basics'
    })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Filter by tag name',
        example: 'beginner'
    })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({
        description: 'Include related entities (questions, options, tags)',
        example: true,
        default: true
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    includeRelations?: boolean;

    @ApiPropertyOptional({
        description: 'Limit number of results',
        example: 20,
        minimum: 1,
        maximum: 100,
        default: 20
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Offset for pagination',
        example: 0,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number;
}
