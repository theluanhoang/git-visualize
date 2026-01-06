import { PartialType } from '@nestjs/swagger';
import { CreateQuizDTO } from './create-quiz.dto';

export class UpdateQuizDTO extends PartialType(CreateQuizDTO) {}
