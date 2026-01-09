import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function fixPaymentTable() {
  const dataSource = new DataSource(createDataSourceOptions());

  try {
    console.log('🔄 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check if payment table exists
    const paymentTableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment'
      );
    `);

    if (!paymentTableExists[0]?.exists) {
      console.log('ℹ️  Payment table does not exist yet');
      await dataSource.destroy();
      process.exit(0);
    }

    // Check if subscriptionId column exists
    const subscriptionIdColumnExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payment' 
        AND column_name = 'subscriptionId'
      );
    `);

    // Check if there's any data in payment table
    const paymentCount = await dataSource.query(`
      SELECT COUNT(*) as count FROM payment;
    `);
    const paymentRecordCount = parseInt(paymentCount[0]?.count || '0', 10);

    if (!subscriptionIdColumnExists[0]?.exists && paymentRecordCount > 0) {
      console.log(
        `⚠️  Payment table exists with ${paymentRecordCount} records but subscriptionId column is missing`,
      );
      console.log(
        '🗑️  Deleting all payment records to allow migration to run...',
      );

      await dataSource.query(`DELETE FROM payment;`);

      console.log(`✅ Deleted ${paymentRecordCount} payment records`);
      await dataSource.destroy();
      process.exit(0);
    } else if (!subscriptionIdColumnExists[0]?.exists) {
      console.log(
        'ℹ️  subscriptionId column does not exist yet, and payment table is empty',
      );
      await dataSource.destroy();
      process.exit(0);
    }

    // Check for null values in subscriptionId
    const nullCount = await dataSource.query(`
      SELECT COUNT(*) as count 
      FROM payment 
      WHERE "subscriptionId" IS NULL;
    `);

    const nullRecordCount = parseInt(nullCount[0]?.count || '0', 10);

    if (nullRecordCount > 0) {
      console.log(
        `⚠️  Found ${nullRecordCount} payment records with null subscriptionId`,
      );
      console.log('🗑️  Deleting invalid payment records...');

      await dataSource.query(`
        DELETE FROM payment 
        WHERE "subscriptionId" IS NULL;
      `);

      console.log(`✅ Deleted ${nullRecordCount} invalid payment records`);
    } else {
      console.log('✅ No invalid payment records found');
    }

    await dataSource.destroy();
    console.log('🎉 Payment table fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix payment table:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void fixPaymentTable();
