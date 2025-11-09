import { CommonEntity } from "../../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Practice } from "./practice.entity";

@Entity('practice_tag')
export class PracticeTag extends CommonEntity {
    @Column()
    practiceId: string;

    @ManyToOne(() => Practice, practice => practice.tags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'practiceId' })
    practice: Practice;

    @Column()
    name: string; // Tag name like "beginner", "git-basics", etc.

    @Column({ nullable: true })
    color?: string; // Optional color for UI display
}
