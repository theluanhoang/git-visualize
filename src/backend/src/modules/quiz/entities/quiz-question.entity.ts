import { CommonEntity } from '../../../shared/entities/common.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizOption } from './quiz-option.entity';

export enum QuizQuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
}

@Entity('quiz_question')
export class QuizQuestion extends CommonEntity {
  @Column()
  quizId: string;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @Column('text')
  question: string;

  @Column({
    type: 'enum',
    enum: QuizQuestionType,
    default: QuizQuestionType.SINGLE_CHOICE,
  })
  type: QuizQuestionType;

  @Column({ default: 1 })
  points: number;

  @Column({ default: 0 })
  order: number;

  @Column('text', { nullable: true })
  explanation?: string;

  // Relations
  @OneToMany(() => QuizOption, (option) => option.question, { cascade: true })
  options: QuizOption[];
}
