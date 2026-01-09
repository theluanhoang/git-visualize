import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubscriptionToUser1700000000010 implements MigrationInterface {
  name = 'AddSubscriptionToUser1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const userTable = await queryRunner.getTable('user');
    if (!userTable) return;

    // Add subscriptionStatus column if it doesn't exist
    if (!userTable.findColumnByName('subscriptionStatus')) {
      // Create enum type if it doesn't exist
      await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."user_subscriptionstatus_enum" AS ENUM('FREE', 'PRO', 'EXPIRED');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

      await queryRunner.addColumn(
        'user',
        new TableColumn({
          name: 'subscriptionStatus',
          type: 'enum',
          enum: ['FREE', 'PRO', 'EXPIRED'],
          default: "'FREE'",
          isNullable: false,
        }),
      );
    }

    // Add subscriptionExpiresAt column if it doesn't exist
    if (!userTable.findColumnByName('subscriptionExpiresAt')) {
      await queryRunner.addColumn(
        'user',
        new TableColumn({
          name: 'subscriptionExpiresAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // Create index for subscriptionStatus if it doesn't exist
    const indexes = await queryRunner.getTable('user');
    const hasIndex = await queryRunner.query(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'user' AND indexname = 'IDX_user_subscriptionStatus'
        `);
    if (hasIndex.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_user_subscriptionStatus" ON "user" ("subscriptionStatus")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('user', 'IDX_user_subscriptionStatus');
    await queryRunner.dropColumn('user', 'subscriptionExpiresAt');
    await queryRunner.dropColumn('user', 'subscriptionStatus');
  }
}
