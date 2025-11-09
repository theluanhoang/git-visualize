import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePracticeTables1700000000000 implements MigrationInterface {
    name = 'CreatePracticeTables1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create practice table
        await queryRunner.createTable(
            new Table({
                name: 'practice',
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
                        name: 'scenario',
                        type: 'text',
                        isNullable: false,
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
                        name: 'IDX_practice_lessonId',
                        columnNames: ['lessonId'],
                    },
                    {
                        name: 'IDX_practice_isActive',
                        columnNames: ['isActive'],
                    },
                    {
                        name: 'IDX_practice_order',
                        columnNames: ['order'],
                    },
                ],
            }),
            true,
        );

        // Create practice_instruction table
        await queryRunner.createTable(
            new Table({
                name: 'practice_instruction',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'practiceId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'content',
                        type: 'text',
                        isNullable: false,
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
                        columnNames: ['practiceId'],
                        referencedTableName: 'practice',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_practice_instruction_practiceId',
                        columnNames: ['practiceId'],
                    },
                ],
            }),
            true,
        );

        // Create practice_hint table
        await queryRunner.createTable(
            new Table({
                name: 'practice_hint',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'practiceId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'content',
                        type: 'text',
                        isNullable: false,
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
                        columnNames: ['practiceId'],
                        referencedTableName: 'practice',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_practice_hint_practiceId',
                        columnNames: ['practiceId'],
                    },
                ],
            }),
            true,
        );

        // Create practice_expected_command table
        await queryRunner.createTable(
            new Table({
                name: 'practice_expected_command',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'practiceId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'command',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'order',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'isRequired',
                        type: 'boolean',
                        default: true,
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
                        columnNames: ['practiceId'],
                        referencedTableName: 'practice',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_practice_expected_command_practiceId',
                        columnNames: ['practiceId'],
                    },
                ],
            }),
            true,
        );

        // Create practice_validation_rule table
        await queryRunner.createTable(
            new Table({
                name: 'practice_validation_rule',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'practiceId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['min_commands', 'required_commands', 'expected_graph_state', 'custom'],
                        isNullable: false,
                    },
                    {
                        name: 'value',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'message',
                        type: 'text',
                        isNullable: true,
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
                        columnNames: ['practiceId'],
                        referencedTableName: 'practice',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_practice_validation_rule_practiceId',
                        columnNames: ['practiceId'],
                    },
                ],
            }),
            true,
        );

        // Create practice_tag table
        await queryRunner.createTable(
            new Table({
                name: 'practice_tag',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'practiceId',
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
                        columnNames: ['practiceId'],
                        referencedTableName: 'practice',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_practice_tag_practiceId',
                        columnNames: ['practiceId'],
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.dropTable('practice_tag');
        await queryRunner.dropTable('practice_validation_rule');
        await queryRunner.dropTable('practice_expected_command');
        await queryRunner.dropTable('practice_hint');
        await queryRunner.dropTable('practice_instruction');
        await queryRunner.dropTable('practice');
    }
}