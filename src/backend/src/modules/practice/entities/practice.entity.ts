import { CommonEntity } from "../../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Lesson } from "../../lessons/lesson.entity";
import { PracticeInstruction } from "./practice-instruction.entity";
import { PracticeHint } from "./practice-hint.entity";
import { PracticeExpectedCommand } from "./practice-expected-command.entity";
import { PracticeValidationRule } from "./practice-validation-rule.entity";
import { PracticeTag } from "./practice-tag.entity";
import type { IRepositoryState } from "../../git-engine/git-engine.interface";

@Entity('practice')
export class Practice extends CommonEntity {
    @Column()
    lessonId: string;

    @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @Column()
    title: string;

    @Column('text')
    scenario: string;

    @Column({ default: 1 })
    difficulty: number; // 1-5

    @Column({ default: 0 })
    estimatedTime: number; // minutes

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    order: number; // For multiple practices per lesson

    @Column({ default: 1 })
    version: number;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    completions: number;

    @Column('jsonb', { nullable: true })
    goalRepositoryState: IRepositoryState; // Target repository state for visualization

    // Relations
    @OneToMany(() => PracticeInstruction, instruction => instruction.practice, { cascade: true })
    instructions: PracticeInstruction[];

    @OneToMany(() => PracticeHint, hint => hint.practice, { cascade: true })
    hints: PracticeHint[];

    @OneToMany(() => PracticeExpectedCommand, command => command.practice, { cascade: true })
    expectedCommands: PracticeExpectedCommand[];

    @OneToMany(() => PracticeValidationRule, rule => rule.practice, { cascade: true })
    validationRules: PracticeValidationRule[];

    @OneToMany(() => PracticeTag, tag => tag.practice, { cascade: true })
    tags: PracticeTag[];
}
