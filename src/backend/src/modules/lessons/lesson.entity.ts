import { CommonEntity } from '../../shared/entities/common.entity';
import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ELessonStatus } from './lesson.interface';
import { User } from '../users/user.entity';

@Entity('lesson')
@Index('IDX_lesson_slug', ['slug'])
@Index('IDX_lesson_slug_status', ['slug', 'status'])
export class Lesson extends CommonEntity {
  @Column()
  content: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  slug: string;

  @Column({ default: 0 })
  views: number;

  @Column({ nullable: true })
  practice?: string;

  @Column({
    type: 'enum',
    enum: ELessonStatus,
    default: ELessonStatus.PUBLISHED,
  })
  status: ELessonStatus;

  @Column({ name: 'authorId', nullable: true })
  authorId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'authorId' })
  author?: User;

  @Column({ name: 'isPublic', default: true })
  isPublic: boolean;

  @Column({ name: 'isProContent', default: false })
  isProContent: boolean;
}
