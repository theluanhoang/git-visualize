import { Module, forwardRef } from '@nestjs/common';
import { PublicController } from './public.controller';
import { LessonModule } from '../lessons/lesson.module';
import { PracticeModule } from '../practice/practice.module';
import { UserModule } from '../users/user.module';
import { PublicService } from './public.service';

@Module({
  imports: [
    forwardRef(() => LessonModule),
    forwardRef(() => PracticeModule),
    forwardRef(() => UserModule),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}


