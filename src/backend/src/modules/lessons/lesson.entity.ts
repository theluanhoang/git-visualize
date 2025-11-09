import { CommonEntity } from "../../shared/entities/common.entity";
import { Column, Entity } from "typeorm";
import { ELessonStatus } from "./lesson.interface";

@Entity('lesson')
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

    @Column({ type: 'enum', enum: ELessonStatus, default: ELessonStatus.PUBLISHED })
    status: ELessonStatus;
}