import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateQuizTables1700000000007 implements MigrationInterface {
    name = 'CreateQuizTables1700000000007';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create quiz table
        await queryRunner.createTable(
            new Table({
                name: 'quiz',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'lessonId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'difficulty',
                        type: 'int',
                        default: 1,
                    },
                    {
                        name: 'estimatedTime',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'order',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'views',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'completions',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'passingScore',
                        type: 'int',
                        default: 70,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['lessonId'],
                        referencedTableName: 'lesson',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_quiz_lessonId',
                        columnNames: ['lessonId'],
                    },
                    {
                        name: 'IDX_quiz_isActive',
                        columnNames: ['isActive'],
                    },
                    {
                        name: 'IDX_quiz_order',
                        columnNames: ['order'],
                    },
                ],
            }),
            true,
        );

        // Create quiz_question table
        await queryRunner.createTable(
            new Table({
                name: 'quiz_question',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'quizId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'question',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['single_choice', 'multiple_choice', 'true_false'],
                        // Use quoted string so Postgres treats this as a literal enum value,
                        // not a column reference in the DEFAULT expression.
                        default: "'single_choice'",
                    },
                    {
                        name: 'points',
                        type: 'int',
                        default: 1,
                    },
                    {
                        name: 'order',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'explanation',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['quizId'],
                        referencedTableName: 'quiz',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_quiz_question_quizId',
                        columnNames: ['quizId'],
                    },
                    {
                        name: 'IDX_quiz_question_order',
                        columnNames: ['order'],
                    },
                ],
            }),
            true,
        );

        // Create quiz_option table
        await queryRunner.createTable(
            new Table({
                name: 'quiz_option',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'questionId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'text',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'isCorrect',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'order',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['questionId'],
                        referencedTableName: 'quiz_question',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_quiz_option_questionId',
                        columnNames: ['questionId'],
                    },
                    {
                        name: 'IDX_quiz_option_order',
                        columnNames: ['order'],
                    },
                ],
            }),
            true,
        );

        // Create quiz_tag table
        await queryRunner.createTable(
            new Table({
                name: 'quiz_tag',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'quizId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'color',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['quizId'],
                        referencedTableName: 'quiz',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_quiz_tag_quizId',
                        columnNames: ['quizId'],
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.dropTable('quiz_tag');
        await queryRunner.dropTable('quiz_option');
        await queryRunner.dropTable('quiz_question');
        await queryRunner.dropTable('quiz');
    }
}
