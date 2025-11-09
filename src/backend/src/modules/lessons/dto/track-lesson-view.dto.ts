import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackLessonViewDto {
    @ApiProperty({ description: 'Lesson ID to track view' })
    @IsNotEmpty()
    @IsUUID()
    lessonId: string;
}

