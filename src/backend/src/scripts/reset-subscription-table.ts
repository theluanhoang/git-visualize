import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function resetSubscriptionTable() {
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

    if (subscriptionTableExists[0]?.exists) {
      console.log('🗑️  Dropping existing subscription table...');
      await dataSource.query(`DROP TABLE IF EXISTS subscription CASCADE;`);
      console.log('✅ Subscription table dropped');
    }

    console.log('✅ Subscription table reset successfully!');
    console.log('💡 Now run: yarn run migration:run');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset subscription table:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void resetSubscriptionTable();










