import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import type { IRepositoryState } from '../../git-engine/git-engine.interface';
import { CommonEntity } from 'src/shared/entities/common.entity';

@Entity('practice_repository_state')
@Unique(['practiceId', 'userId'])
export class PracticeRepositoryState extends CommonEntity {
  @Index()
  @Column()
  practiceId!: string;

  @Index()
  @Column()
  userId!: string;

  @Column('jsonb')
  repositoryState!: IRepositoryState;

  @Column({ default: 1 })
  version!: number;

  @Column({ nullable: true })
  lastModifiedBy?: string;
}


