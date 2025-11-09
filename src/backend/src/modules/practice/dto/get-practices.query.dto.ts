import { IsString, IsNumber, IsBoolean, IsOptional, Min, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
const ToBoolean = () => {
    const toPlain = Transform(
        ({ value }) => {
            return value;
        },
        {
            toPlainOnly: true,
        }
    );
    const toClass = (target: any, key: string) => {
        return Transform(
            ({ obj }) => {
                return valueToBoolean(obj[key]);
            },
            {
                toClassOnly: true,
            }
        )(target, key);
    };
    return function (target: any, key: string) {
        toPlain(target, key);
        toClass(target, key);
    };
};

const valueToBoolean = (value: any) => {
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
        return true;
    }
    if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
        return false;
    }
    return undefined;
};

export { ToBoolean };
export class GetPracticesQueryDto {
    @ApiPropertyOptional({
        description: 'Number of practices to return',
        example: 20,
        minimum: 0,
        default: 20
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value))
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Number of practices to skip',
        example: 0,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value))
    offset?: number = 0;

    @ApiPropertyOptional({
        description: 'Get single practice by ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID()
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
        example: 'git-basics'
    })
    @IsOptional()
    @IsString()
    lessonSlug?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Search query for title, scenario, or lesson title',
        example: 'git basics'
    })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Filter by difficulty level',
        example: 2,
        minimum: 1,
        maximum: 5
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => parseInt(value))
    difficulty?: number;

    @ApiPropertyOptional({
        description: 'Filter by tag name',
        example: 'beginner'
    })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({
        description: 'Whether to include related entities (instructions, hints, etc.)',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    @ToBoolean()
    includeRelations?: boolean = true;

    @ApiPropertyOptional({
        description: 'Only include practices whose lessons are PUBLISHED',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    @ToBoolean()
    publishedOnly?: boolean = true;
}