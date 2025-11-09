import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class OAuthTables1700000000001 implements MigrationInterface {
  name = 'OAuthTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update user table to make password_hash nullable
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "password_hash" DROP NOT NULL
    `);

    // Add new columns to user table
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "first_name" VARCHAR,
      ADD COLUMN "last_name" VARCHAR,
      ADD COLUMN "avatar" VARCHAR,
      ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true
    `);

    // Create oauth_provider table
    await queryRunner.createTable(
      new Table({
        name: 'oauth_provider',
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
            name: 'provider',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'provider_id',
            type: 'varchar',
          },
          {
            name: 'provider_email',
            type: 'varchar',
          },
          {
            name: 'provider_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'provider_avatar',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'access_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'token_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create unique index on provider and provider_id
    await queryRunner.createIndex('oauth_provider', new TableIndex({
      name: 'IDX_oauth_provider_provider_provider_id',
      columnNames: ['provider', 'provider_id'],
      isUnique: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop unique index first
    await queryRunner.dropIndex('oauth_provider', 'IDX_oauth_provider_provider_provider_id');
    
    // Drop oauth_provider table
    await queryRunner.dropTable('oauth_provider');

    // Remove new columns from user table
    await queryRunner.query(`
      ALTER TABLE "user" 
      DROP COLUMN "first_name",
      DROP COLUMN "last_name",
      DROP COLUMN "avatar",
      DROP COLUMN "is_active"
    `);

    // Make password_hash NOT NULL again
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "password_hash" SET NOT NULL
    `);
  }
}
