import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function fixSubscriptionTable() {
  const dataSource = new DataSource(createDataSourceOptions());
  
  try {
    console.log('🔄 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check if subscription table exists
    const subscriptionTableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription'
      );
    `);

    if (!subscriptionTableExists[0]?.exists) {
      console.log('ℹ️  Subscription table does not exist yet');
      await dataSource.destroy();
      process.exit(0);
    }

    // Check if userId column exists
    const userIdColumnExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription' 
        AND column_name = 'userId'
      );
    `);

    // Check if there's any data in subscription table
    const subscriptionCount = await dataSource.query(`
      SELECT COUNT(*) as count FROM subscription;
    `);
    const subscriptionRecordCount = parseInt(subscriptionCount[0]?.count || '0', 10);

    if (!userIdColumnExists[0]?.exists && subscriptionRecordCount > 0) {
      console.log(`⚠️  Subscription table exists with ${subscriptionRecordCount} records but userId column is missing`);
      console.log('🗑️  Deleting all subscription records to allow migration to run...');
      
      await dataSource.query(`DELETE FROM subscription;`);
      
      console.log(`✅ Deleted ${subscriptionRecordCount} subscription records`);
      await dataSource.destroy();
      process.exit(0);
    } else if (!userIdColumnExists[0]?.exists) {
      console.log('ℹ️  userId column does not exist yet, and subscription table is empty');
      await dataSource.destroy();
      process.exit(0);
    }

    // Check for null values in userId
    const nullCount = await dataSource.query(`
      SELECT COUNT(*) as count 
      FROM subscription 
      WHERE "userId" IS NULL;
    `);

    const nullRecordCount = parseInt(nullCount[0]?.count || '0', 10);

    if (nullRecordCount > 0) {
      console.log(`⚠️  Found ${nullRecordCount} subscription records with null userId`);
      console.log('🗑️  Deleting invalid subscription records...');
      
      await dataSource.query(`
        DELETE FROM subscription 
        WHERE "userId" IS NULL;
      `);
      
      console.log(`✅ Deleted ${nullRecordCount} invalid subscription records`);
    } else {
      console.log('✅ No invalid subscription records found');
    }

    await dataSource.destroy();
    console.log('🎉 Subscription table fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix subscription table:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void fixSubscriptionTable();








