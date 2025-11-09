import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ELessonStatus } from '../lesson.interface';

export class GetLessonsQueryDto {
    @ApiPropertyOptional({ description: 'Pagination limit', default: 20, minimum: 1, maximum: 100 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;

    @ApiPropertyOptional({ description: 'Pagination offset', default: 0, minimum: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Filter by lesson id (uuid)' })
    @IsString()
    @IsOptional()
    id?: string;

    @ApiPropertyOptional({ description: 'Filter by slug' })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiPropertyOptional({ description: 'Filter by status', enum: ELessonStatus })
    @IsEnum(ELessonStatus)
    @IsOptional()
    status?: ELessonStatus;

    @ApiPropertyOptional({ description: 'Full-text search on title/description' })
    @IsString()
    @IsOptional()
    q?: string;

    @ApiPropertyOptional({ description: 'Include practice content', default: false })
    @Type(() => Boolean)
    @IsOptional()
    includePractices?: boolean = false;
}


