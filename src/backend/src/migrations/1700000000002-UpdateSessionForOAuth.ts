import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateSessionForOAuth1700000000002 implements MigrationInterface {
  name = 'UpdateSessionForOAuth1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add OAuth related columns to session table
    await queryRunner.addColumns('session', [
      new TableColumn({
        name: 'session_type',
        type: 'enum',
        enum: ['PASSWORD', 'OAUTH'],
        default: "'PASSWORD'",
      }),
      new TableColumn({
        name: 'oauth_provider',
        type: 'enum',
        enum: ['GOOGLE', 'GITHUB', 'FACEBOOK'],
        isNullable: true,
      }),
      new TableColumn({
        name: 'oauth_provider_id',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'oauth_access_token_hash',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'oauth_refresh_token_hash',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'oauth_token_expires_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    ]);

    // Remove token columns from oauth_provider table
    await queryRunner.dropColumns('oauth_provider', [
      'access_token',
      'refresh_token',
      'token_expires_at',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back token columns to oauth_provider table
    await queryRunner.addColumns('oauth_provider', [
      new TableColumn({
        name: 'access_token',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'refresh_token',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'token_expires_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    ]);

    // Remove OAuth columns from session table
    await queryRunner.dropColumns('session', [
      'session_type',
      'oauth_provider',
      'oauth_provider_id',
      'oauth_access_token_hash',
      'oauth_refresh_token_hash',
      'oauth_token_expires_at',
    ]);
  }
}
