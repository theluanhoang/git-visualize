import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToLessonSlug1700000000015 implements MigrationInterface {
  name = 'AddIndexToLessonSlug1700000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if index already exists
    const hasSlugIndex = await queryRunner.query(`
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'lesson' AND indexname = 'IDX_lesson_slug'
    `);
    
    if (hasSlugIndex.length === 0) {
      // Create unique index on slug for fast lookups
      await queryRunner.query(
        `CREATE INDEX "IDX_lesson_slug" ON "lesson" ("slug")`,
      );
    }

    // Also add composite index for common query pattern: slug + status
    const hasSlugStatusIndex = await queryRunner.query(`
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'lesson' AND indexname = 'IDX_lesson_slug_status'
    `);
    
    if (hasSlugStatusIndex.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_lesson_slug_status" ON "lesson" ("slug", "status")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_lesson_slug_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_lesson_slug"`);
  }
}

