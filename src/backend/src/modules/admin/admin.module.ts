import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { MailModule } from '../mail/mail.module';
import { AdminService } from './admin.service';
import { AdminInitService } from './admin-init.service';
import { LessonModule } from '../lessons/lesson.module';
import { AdminController } from './admin.controller';
import { SessionModule } from '../sessions/session.module';
import { PracticeModule } from '../practice/practice.module';

@Module({
  imports: [
    forwardRef(() => UserModule), 
    MailModule, 
    LessonModule,
    SessionModule,
    PracticeModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminInitService],
  exports: [AdminService],
})
export class AdminModule {}


