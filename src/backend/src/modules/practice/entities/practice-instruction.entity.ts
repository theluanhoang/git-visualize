import { CommonEntity } from "../../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Practice } from "./practice.entity";

@Entity('practice_instruction')
export class PracticeInstruction extends CommonEntity {
    @Column()
    practiceId: string;

    @ManyToOne(() => Practice, practice => practice.instructions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'practiceId' })
    practice: Practice;

    @Column('text')
    content: string;

    @Column({ default: 0 })
    order: number; // For ordering instructions
}
