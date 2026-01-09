import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function resetPaymentTable() {
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

    if (paymentTableExists[0]?.exists) {
      console.log('🗑️  Dropping existing payment table...');
      await dataSource.query(`DROP TABLE IF EXISTS payment CASCADE;`);
      console.log('✅ Payment table dropped');
    }

    // Check if subscription table exists (required for payment FK)
    const subscriptionTableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription'
      );
    `);

    if (!subscriptionTableExists[0]?.exists) {
      console.log(
        '⚠️  Subscription table does not exist. Please run migrations first.',
      );
      await dataSource.destroy();
      process.exit(1);
    }

    console.log('✅ Payment table reset successfully!');
    console.log('💡 Now run: yarn run migration:run');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset payment table:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void resetPaymentTable();
