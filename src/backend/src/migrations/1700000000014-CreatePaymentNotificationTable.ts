import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePaymentNotificationTable1700000000014
  implements MigrationInterface
{
  name = 'CreatePaymentNotificationTable1700000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if payment_notification table already exists
    const notificationTableExists = await queryRunner.hasTable(
      'payment_notification',
    );
    if (!notificationTableExists) {
      // Create enum types if they don't exist
      await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."payment_notification_notificationstatus_enum" AS ENUM('PENDING', 'DELIVERED', 'FAILED');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

      await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."payment_notification_notificationchannel_enum" AS ENUM('WEBSOCKET', 'POLLING');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

      // Create payment_notification table
      await queryRunner.createTable(
        new Table({
          name: 'payment_notification',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'userId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'paymentId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'status',
              type: 'enum',
              enum: ['PENDING', 'DELIVERED', 'FAILED'],
              default: "'PENDING'",
            },
            {
              name: 'channel',
              type: 'enum',
              enum: ['WEBSOCKET', 'POLLING'],
              isNullable: true,
            },
            {
              name: 'eventData',
              type: 'jsonb',
              isNullable: true,
            },
            {
              name: 'deliveredAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'deliveryAttempts',
              type: 'int',
              default: 0,
            },
            {
              name: 'errorMessage',
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
            },
            {
              name: 'deletedAt',
              type: 'timestamp',
              isNullable: true,
            },
          ],
          foreignKeys: [
            {
              columnNames: ['userId'],
              referencedTableName: 'user',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
            {
              columnNames: ['paymentId'],
              referencedTableName: 'payment',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );

      // Create indexes
      await queryRunner.createIndex(
        'payment_notification',
        new TableIndex({
          name: 'IDX_payment_notification_userId',
          columnNames: ['userId'],
        }),
      );

      await queryRunner.createIndex(
        'payment_notification',
        new TableIndex({
          name: 'IDX_payment_notification_paymentId',
          columnNames: ['paymentId'],
        }),
      );

      await queryRunner.createIndex(
        'payment_notification',
        new TableIndex({
          name: 'IDX_payment_notification_status',
          columnNames: ['status'],
        }),
      );

      await queryRunner.createIndex(
        'payment_notification',
        new TableIndex({
          name: 'IDX_payment_notification_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const notificationTableExists = await queryRunner.hasTable(
      'payment_notification',
    );
    if (notificationTableExists) {
      await queryRunner.dropTable('payment_notification');
    }

    // Drop enum types
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_notification_notificationstatus_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_notification_notificationchannel_enum"`,
    );
  }
}
