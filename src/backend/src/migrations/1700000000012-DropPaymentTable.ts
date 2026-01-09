import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPaymentTable1700000000012 implements MigrationInterface {
  name = 'DropPaymentTable1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if payment table exists before dropping
    const paymentTableExists = await queryRunner.hasTable('payment');
    if (paymentTableExists) {
      await queryRunner.dropTable('payment');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Payment table will not be recreated
    // If needed, restore from backup
  }
}
