import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateLessonViewTable1700000000004 implements MigrationInterface {
  name = 'CreateLessonViewTable1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create lesson_view table
    await queryRunner.createTable(
      new Table({
        name: 'lesson_view',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'lesson_id',
            type: 'uuid',
          },
          {
            name: 'viewed_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'view_count',
            type: 'int',
            default: 1,
          },
          {
            name: 'last_viewed_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['lesson_id'],
            referencedTableName: 'lesson',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create unique constraint on user_id and lesson_id
    await queryRunner.createUniqueConstraint(
      'lesson_view',
      new TableUnique({
        name: 'UQ_lesson_view_user_lesson',
        columnNames: ['user_id', 'lesson_id'],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'lesson_view',
      new TableIndex({
        name: 'IDX_lesson_view_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'lesson_view',
      new TableIndex({
        name: 'IDX_lesson_view_lesson_id',
        columnNames: ['lesson_id'],
      }),
    );

    await queryRunner.createIndex(
      'lesson_view',
      new TableIndex({
        name: 'IDX_lesson_view_viewed_at',
        columnNames: ['viewed_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('lesson_view', 'IDX_lesson_view_viewed_at');
    await queryRunner.dropIndex('lesson_view', 'IDX_lesson_view_lesson_id');
    await queryRunner.dropIndex('lesson_view', 'IDX_lesson_view_user_id');
    
    // Drop unique constraint
    await queryRunner.dropUniqueConstraint('lesson_view', 'UQ_lesson_view_user_lesson');
    
    // Drop table
    await queryRunner.dropTable('lesson_view');
  }
}

