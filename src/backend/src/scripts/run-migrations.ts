import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function runMigrations() {
  const dataSource = new DataSource(createDataSourceOptions());

  try {
    console.log('🔄 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    console.log('📦 Running migrations...');
    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('ℹ️  No pending migrations');
    } else {
      console.log(`✅ ${migrations.length} migration(s) executed:`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }

    await dataSource.destroy();
    console.log('🎉 Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void runMigrations();
