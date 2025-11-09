import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LessonModule } from './modules/lessons/lesson.module';
import { PracticeModule } from './modules/practice/practice.module';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { envValidationSchema } from './config/validation';
import { GitEngineModule } from './modules/git-engine/git-engine.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { SessionModule } from './modules/sessions/session.module';
import { MailModule } from './modules/mail/mail.module';
import { AdminModule } from './modules/admin/admin.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env',
        '.env.local',
      ],
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    LessonModule,
    PracticeModule,
    GitEngineModule,
    AuthModule,
    UserModule,
    SessionModule,
    MailModule,
    AdminModule,
    PublicModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
