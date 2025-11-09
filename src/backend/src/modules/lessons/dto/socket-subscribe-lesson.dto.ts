import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SubscribeLessonDto {
  @IsString()
  @IsUUID('4', { message: 'lessonId must be a valid UUID' })
  lessonId: string;
}

export class UnsubscribeLessonDto {
  @IsString()
  @IsUUID('4', { message: 'lessonId must be a valid UUID' })
  lessonId: string;
}

