import { CommonEntity } from "../../../shared/entities/common.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Quiz } from "./quiz.entity";

@Entity('quiz_tag')
export class QuizTag extends CommonEntity {
    @Column()
    quizId: string;

    @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizId' })
    quiz: Quiz;

    @Column()
    name: string;

    @Column({ nullable: true })
    color?: string;
}




