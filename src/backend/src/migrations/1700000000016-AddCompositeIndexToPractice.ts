import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexToPractice1700000000016
  implements MigrationInterface
{
  name = 'AddCompositeIndexToPractice1700000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCompositeIndex = (await queryRunner.query(`
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'practice' AND indexname = 'IDX_practice_lessonId_isActive_order'
    `)) as Array<{ '?column?': number }>;

    if (hasCompositeIndex.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_practice_lessonId_isActive_order" ON "practice" ("lessonId", "isActive", "order")`,
      );
    }

    const hasLessonActiveIndex = (await queryRunner.query(`
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'practice' AND indexname = 'IDX_practice_lessonId_isActive'
    `)) as Array<{ '?column?': number }>;

    if (hasLessonActiveIndex.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_practice_lessonId_isActive" ON "practice" ("lessonId", "isActive")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_practice_lessonId_isActive_order"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_practice_lessonId_isActive"`,
    );
  }
}
