import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePaymentTable1700000000013 implements MigrationInterface {
  name = 'CreatePaymentTable1700000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if payment table already exists
    const paymentTableExists = await queryRunner.hasTable('payment');
    if (!paymentTableExists) {
      // Create enum types if they don't exist
      await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."payment_paymentmethod_enum" AS ENUM('CASSO', 'MANUAL');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

      await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."payment_paymentstatus_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

      // Create payment table
      await queryRunner.createTable(
        new Table({
          name: 'payment',
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
              name: 'subscriptionId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'paymentMethod',
              type: 'enum',
              enum: ['CASSO', 'MANUAL'],
              isNullable: false,
            },
            {
              name: 'status',
              type: 'enum',
              enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
              default: "'PENDING'",
            },
            {
              name: 'amount',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: false,
            },
            {
              name: 'currency',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'transactionId',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'paymentDate',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'paymentUrl',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'qrCode',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'bankAccount',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'bankName',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'cassoTransactionId',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'cassoWebhookData',
              type: 'jsonb',
              isNullable: true,
            },
            {
              name: 'notes',
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
              columnNames: ['subscriptionId'],
              referencedTableName: 'subscription',
              referencedColumnNames: ['id'],
              onDelete: 'SET NULL',
            },
          ],
        }),
        true,
      );

      // Create indexes
      await queryRunner.createIndex(
        'payment',
        new TableIndex({
          name: 'IDX_payment_userId',
          columnNames: ['userId'],
        }),
      );

      await queryRunner.createIndex(
        'payment',
        new TableIndex({
          name: 'IDX_payment_subscriptionId',
          columnNames: ['subscriptionId'],
        }),
      );

      await queryRunner.createIndex(
        'payment',
        new TableIndex({
          name: 'IDX_payment_status',
          columnNames: ['status'],
        }),
      );

      await queryRunner.createIndex(
        'payment',
        new TableIndex({
          name: 'IDX_payment_paymentMethod',
          columnNames: ['paymentMethod'],
        }),
      );

      await queryRunner.createIndex(
        'payment',
        new TableIndex({
          name: 'IDX_payment_transactionId',
          columnNames: ['transactionId'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const paymentTableExists = await queryRunner.hasTable('payment');
    if (paymentTableExists) {
      await queryRunner.dropTable('payment');
    }

    // Drop enum types
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_paymentstatus_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."payment_paymentmethod_enum"`,
    );
  }
}

