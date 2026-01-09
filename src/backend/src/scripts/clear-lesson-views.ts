/**
 * Script to clear all lesson view tracking data from database
 * This will:
 * 1. Delete all records from lesson_view table
 * 2. Reset views count to 0 for all lessons
 */

import { DataSource } from 'typeorm';

async function clearLessonViews() {
  console.log('🧹 Starting lesson views cleanup...\n');

  const { DataSource } = require('typeorm');
  const configuration = require('../config/configuration').default;
  const config = configuration();

  const dataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    entities: [], // Không cần load entities, chỉ dùng raw queries
    synchronize: false,
    logging: false, // Tắt logging để script chạy nhanh hơn
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Count existing records
    const viewCount = await dataSource.query(
      'SELECT COUNT(*) as count FROM lesson_view',
    );
    const count = parseInt(viewCount[0]?.count || '0', 10);
    console.log(`📊 Found ${count} lesson view records\n`);

    if (count === 0) {
      console.log('ℹ️  No lesson views to clear. Already clean!');
      await dataSource.destroy();
      return;
    }

    // Clear all lesson_view records
    console.log('🗑️  Deleting all lesson_view records...');
    await dataSource.query('DELETE FROM lesson_view');
    console.log('✅ All lesson_view records deleted\n');

    // Reset views count to 0 for all lessons
    console.log('🔄 Resetting views count to 0 for all lessons...');
    await dataSource.query('UPDATE lesson SET views = 0');
    console.log('✅ All lesson views count reset to 0\n');

    console.log('🎉 Lesson views cleanup completed successfully!\n');
  } catch (error) {
    console.error('❌ Error clearing lesson views:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

// Run the script
clearLessonViews()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
