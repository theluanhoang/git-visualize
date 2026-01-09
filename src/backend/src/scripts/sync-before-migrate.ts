import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function main() {
  const dataSource = new DataSource(createDataSourceOptions());
  try {
    console.log('🔄 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connection established.');

    // Synchronize base schema (creates missing tables, indexes, etc.)
    console.log('🔄 Synchronizing schema (tables, indexes, constraints)...');
    await dataSource.synchronize();
    console.log('✅ Schema synchronized successfully.');

    // Verify critical indexes exist (for performance optimization)
    console.log('🔍 Verifying critical indexes...');
    const criticalIndexes = [
      'IDX_lesson_slug',
      'IDX_lesson_slug_status',
      'IDX_practice_lessonId',
      'IDX_practice_isActive',
      'IDX_practice_order',
      'IDX_practice_lessonId_isActive',
      'IDX_practice_lessonId_isActive_order',
    ];

    const existingIndexes = await dataSource.query<
      Array<{ indexname: string }>
    >(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND (tablename = 'lesson' OR tablename = 'practice')
    `);

    const existingIndexNames = existingIndexes.map(
      (idx: { indexname: string }) => idx.indexname,
    );

    const missingIndexes = criticalIndexes.filter(
      (idx: string) => !existingIndexNames.includes(idx),
    );

    if (missingIndexes.length > 0) {
      console.warn(
        `⚠️  Warning: Some indexes are missing: ${missingIndexes.join(', ')}`,
      );
      console.warn(
        '   This may impact query performance. Consider running migrations.',
      );
    } else {
      console.log('✅ All critical indexes verified.');
    }

    // Close connection
    await dataSource.destroy();
    console.log('✅ Database connection closed.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Schema synchronization failed:', (err as Error).message);
    console.error('Stack trace:', (err as Error).stack);
    try {
      await dataSource.destroy();
    } catch (destroyErr) {
      console.error('Failed to close database connection:', destroyErr);
    }
    process.exit(1);
  }
}

void main();
