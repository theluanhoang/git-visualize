import { Column, Entity, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { CommonEntity } from '../../shared/entities/common.entity';
import { Lesson } from './lesson.entity';
import { User } from '../users/user.entity';

@Entity('rating')
@Unique(['userId', 'lessonId'])
@Index(['userId'])
@Index(['lessonId'])
@Index(['rating'])
export class Rating extends CommonEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ type: 'int' })
  rating: number; 

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}

