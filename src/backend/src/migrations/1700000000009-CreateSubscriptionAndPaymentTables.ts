import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSubscriptionAndPaymentTables1700000000009 implements MigrationInterface {
    name = 'CreateSubscriptionAndPaymentTables1700000000009';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if subscription table already exists
        const subscriptionTableExists = await queryRunner.hasTable('subscription');
        if (!subscriptionTableExists) {
            // Create enum types if they don't exist
            await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."subscription_plantype_enum" AS ENUM('MONTHLY', 'YEARLY');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            
            await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "public"."subscription_status_enum" AS ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Create subscription table
            await queryRunner.createTable(
            new Table({
                name: 'subscription',
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
                        name: 'planType',
                        type: 'enum',
                        enum: ['MONTHLY', 'YEARLY'],
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'],
                        default: "'PENDING'",
                    },
                    {
                        name: 'startDate',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'endDate',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'autoRenew',
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
                        columnNames: ['userId'],
                        referencedTableName: 'user',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_subscription_userId',
                        columnNames: ['userId'],
                    },
                    {
                        name: 'IDX_subscription_status',
                        columnNames: ['status'],
                    },
                    {
                        name: 'IDX_subscription_planType',
                        columnNames: ['planType'],
                    },
                    {
                        name: 'IDX_subscription_endDate',
                        columnNames: ['endDate'],
                    },
                ],
            }),
            true,
        );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('subscription');
    }
}
