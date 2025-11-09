import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique, TableForeignKey } from 'typeorm';

export class CreateRatingTable1700000000005 implements MigrationInterface {
  name = 'CreateRatingTable1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create rating table
    await queryRunner.createTable(
      new Table({
        name: 'rating',
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
            name: 'rating',
            type: 'int',
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
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
      'rating',
      new TableUnique({
        name: 'UQ_rating_user_lesson',
        columnNames: ['user_id', 'lesson_id'],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'rating',
      new TableIndex({
        name: 'IDX_rating_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'rating',
      new TableIndex({
        name: 'IDX_rating_lesson_id',
        columnNames: ['lesson_id'],
      }),
    );

    await queryRunner.createIndex(
      'rating',
      new TableIndex({
        name: 'IDX_rating_rating',
        columnNames: ['rating'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('rating', 'IDX_rating_rating');
    await queryRunner.dropIndex('rating', 'IDX_rating_lesson_id');
    await queryRunner.dropIndex('rating', 'IDX_rating_user_id');
    
    // Drop unique constraint
    await queryRunner.dropUniqueConstraint('rating', 'UQ_rating_user_lesson');
    
    // Drop table
    await queryRunner.dropTable('rating');
  }
}

