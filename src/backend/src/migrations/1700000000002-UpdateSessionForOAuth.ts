import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateSessionForOAuth1700000000002 implements MigrationInterface {
  name = 'UpdateSessionForOAuth1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add OAuth related columns to session table (only if they don't exist)
    const sessionTable = await queryRunner.getTable('session');
    if (sessionTable) {
      const columnsToAdd: TableColumn[] = [];
      
      if (!sessionTable.findColumnByName('session_type')) {
        columnsToAdd.push(new TableColumn({
          name: 'session_type',
          type: 'enum',
          enum: ['PASSWORD', 'OAUTH'],
          default: "'PASSWORD'",
        }));
      }
      if (!sessionTable.findColumnByName('oauth_provider')) {
        columnsToAdd.push(new TableColumn({
          name: 'oauth_provider',
          type: 'enum',
          enum: ['GOOGLE', 'GITHUB', 'FACEBOOK'],
          isNullable: true,
        }));
      }
      if (!sessionTable.findColumnByName('oauth_provider_id')) {
        columnsToAdd.push(new TableColumn({
          name: 'oauth_provider_id',
          type: 'varchar',
          isNullable: true,
        }));
      }
      if (!sessionTable.findColumnByName('oauth_access_token_hash')) {
        columnsToAdd.push(new TableColumn({
          name: 'oauth_access_token_hash',
          type: 'varchar',
          isNullable: true,
        }));
      }
      if (!sessionTable.findColumnByName('oauth_refresh_token_hash')) {
        columnsToAdd.push(new TableColumn({
          name: 'oauth_refresh_token_hash',
          type: 'varchar',
          isNullable: true,
        }));
      }
      if (!sessionTable.findColumnByName('oauth_token_expires_at')) {
        columnsToAdd.push(new TableColumn({
          name: 'oauth_token_expires_at',
          type: 'timestamptz',
          isNullable: true,
        }));
      }
      
      if (columnsToAdd.length > 0) {
        await queryRunner.addColumns('session', columnsToAdd);
      }
    }

    // Remove token columns from oauth_provider table (only if they exist)
    const oauthProviderTable = await queryRunner.getTable('oauth_provider');
    if (oauthProviderTable) {
      const columnsToDrop: string[] = [];
      if (oauthProviderTable.findColumnByName('access_token')) {
        columnsToDrop.push('access_token');
      }
      if (oauthProviderTable.findColumnByName('refresh_token')) {
        columnsToDrop.push('refresh_token');
      }
      if (oauthProviderTable.findColumnByName('token_expires_at')) {
        columnsToDrop.push('token_expires_at');
      }
      
      if (columnsToDrop.length > 0) {
        await queryRunner.dropColumns('oauth_provider', columnsToDrop);
      }
    }
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
