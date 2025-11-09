import { CommonEntity } from "../../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Practice } from "./practice.entity";

export enum ValidationRuleType {
    MIN_COMMANDS = 'min_commands',
    REQUIRED_COMMANDS = 'required_commands',
    EXPECTED_GRAPH_STATE = 'expected_graph_state',
    CUSTOM = 'custom'
}

@Entity('practice_validation_rule')
export class PracticeValidationRule extends CommonEntity {
    @Column()
    practiceId: string;

    @ManyToOne(() => Practice, practice => practice.validationRules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'practiceId' })
    practice: Practice;

    @Column({ type: 'enum', enum: ValidationRuleType })
    type: ValidationRuleType;

    @Column('text')
    value: string; // JSON string of the validation value

    @Column('text', { nullable: true })
    message?: string; // Custom error message

    @Column({ default: 0 })
    order: number; // For ordering validation rules
}
