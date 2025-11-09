import { CommonEntity } from "../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn, Index, Unique } from "typeorm";
import { Lesson } from "./lesson.entity";
import { User } from "../users/user.entity";

@Entity('lesson_view')
@Unique(['userId', 'lessonId'])
@Index(['userId'])
@Index(['lessonId'])
@Index(['viewedAt'])
export class LessonView extends CommonEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'lesson_id' })
    lessonId: string;

    @Column({ name: 'viewed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    viewedAt: Date;

    @Column({ name: 'view_count', type: 'int', default: 1 })
    viewCount: number;

    @Column({ name: 'last_viewed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastViewedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lesson_id' })
    lesson: Lesson;
}

