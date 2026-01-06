import { CommonEntity } from "../../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Lesson } from "../../lessons/lesson.entity";
import { QuizQuestion } from "./quiz-question.entity";
import { QuizTag } from "./quiz-tag.entity";

@Entity('quiz')
export class Quiz extends CommonEntity {
    @Column()
    lessonId: string;

    @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @Column()
    title: string;

    @Column('text', { nullable: true })
    description?: string;

    @Column({ default: 1 })
    difficulty: number; // 1-5

    @Column({ default: 0 })
    estimatedTime: number; // minutes

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    order: number; // For multiple quizzes per lesson

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    completions: number;

    @Column({ default: 70 })
    passingScore: number; // Percentage required to pass (0-100)

    // Relations
    @OneToMany(() => QuizQuestion, question => question.quiz, { cascade: true })
    questions: QuizQuestion[];

    @OneToMany(() => QuizTag, tag => tag.quiz, { cascade: true })
    tags: QuizTag[];
}
