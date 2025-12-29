import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Practice } from './entities/practice.entity';
import { PracticeInstruction } from './entities/practice-instruction.entity';
import { PracticeHint } from './entities/practice-hint.entity';
import { PracticeExpectedCommand } from './entities/practice-expected-command.entity';
import { PracticeValidationRule } from './entities/practice-validation-rule.entity';
import { PracticeTag } from './entities/practice-tag.entity';
import { PracticeController } from './practice.controller';
import { PracticeAggregateService } from './services/practice-aggregate.service';
import { PracticeEntityService } from './services/practice-entity.service';
import { PracticeInstructionService } from './services/practice-instruction.service';
import { PracticeHintService } from './services/practice-hint.service';
import { PracticeExpectedCommandService } from './services/practice-expected-command.service';
import { PracticeValidationRuleService } from './services/practice-validation-rule.service';
import { PracticeRepositoryState } from './entities/practice-repository-state.entity';
import { PracticeRepositoryStateService } from './services/practice-repository-state.service';
import { PracticeTagService } from './services/practice-tag.service';
import { PracticeAiAssistantService } from './services/practice-ai-assistant.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Practice,
      PracticeInstruction,
      PracticeHint,
      PracticeExpectedCommand,
      PracticeValidationRule,
      PracticeTag,
      PracticeRepositoryState,
    ]),
    SubscriptionModule,
  ],
  controllers: [PracticeController],
  providers: [
    PracticeAggregateService,
    PracticeEntityService,
    PracticeInstructionService,
    PracticeHintService,
    PracticeExpectedCommandService,
    PracticeValidationRuleService,
    PracticeTagService,
    PracticeRepositoryStateService,
    PracticeAiAssistantService,
  ],
  exports: [
    PracticeAggregateService,
    PracticeEntityService,
    PracticeRepositoryStateService,
  ],
})
export class PracticeModule {}
