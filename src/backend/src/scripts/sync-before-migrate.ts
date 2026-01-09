import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function main() {
  const dataSource = new DataSource(createDataSourceOptions());
  try {
    await dataSource.initialize();
    // Synchronize base schema (creates missing tables like 'lesson', 'user', etc.)
    await dataSource.synchronize();
    // Close connection
    await dataSource.destroy();

    console.log('✅ Schema synchronized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema synchronization failed:', (err as Error).message);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void main();
