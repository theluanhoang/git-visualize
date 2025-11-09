import { CommonEntity } from "../../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Practice } from "./practice.entity";

@Entity('practice_expected_command')
export class PracticeExpectedCommand extends CommonEntity {
    @Column()
    practiceId: string;

    @ManyToOne(() => Practice, practice => practice.expectedCommands, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'practiceId' })
    practice: Practice;

    @Column('text')
    command: string;

    @Column({ default: 0 })
    order: number; // For ordering commands

    @Column({ default: true })
    isRequired: boolean; // Whether this command is required
}
