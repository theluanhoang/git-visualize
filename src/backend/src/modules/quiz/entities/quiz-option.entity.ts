import { CommonEntity } from '../../../shared/entities/common.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_option')
export class QuizOption extends CommonEntity {
  @Column()
  questionId: string;

  @ManyToOne(() => QuizQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: QuizQuestion;

  @Column('text')
  text: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ default: 0 })
  order: number;
}
