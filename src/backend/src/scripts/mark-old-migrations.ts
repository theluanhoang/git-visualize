import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function markOldMigrations() {
  const dataSource = new DataSource(createDataSourceOptions());
  
  try {
    console.log('🔄 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    // List of old migrations that have already been run
    const oldMigrations = [
      'CreatePracticeTables1700000000000',
      'OAuthTables1700000000001',
      'UpdateSessionForOAuth1700000000002',
      'AddVersionToPractice1700000000003',
      'CreateLessonViewTable1700000000004',
      'CreateRatingTable1700000000005',
      'CreateQuizTables1700000000007',
    ];

    console.log('📝 Marking old migrations as executed...');
    
    for (const migrationName of oldMigrations) {
      // Check if migration is already marked
      const existing = await dataSource.query(
        `SELECT * FROM migrations WHERE name = $1`,
        [migrationName]
      );

      if (existing.length === 0) {
        // Insert migration record
        await dataSource.query(
          `INSERT INTO migrations (timestamp, name) VALUES ($1, $2)`,
          [parseInt(migrationName.match(/\d+/)?.[0] || '0'), migrationName]
        );
        console.log(`   ✅ Marked ${migrationName} as executed`);
      } else {
        console.log(`   ℹ️  ${migrationName} already marked`);
      }
    }

    await dataSource.destroy();
    console.log('🎉 Old migrations marked successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to mark migrations:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void markOldMigrations();










