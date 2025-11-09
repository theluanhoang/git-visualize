import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitEngineController } from './git-engine.controller';
import { GitEngineService } from './git-engine.service';
import { Practice } from '../practice/entities/practice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Practice])],
  controllers: [GitEngineController],
  providers: [GitEngineService]
})
export class GitEngineModule {}
