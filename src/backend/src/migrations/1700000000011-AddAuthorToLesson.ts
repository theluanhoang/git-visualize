import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddAuthorToLesson1700000000011 implements MigrationInterface {
    name = 'AddAuthorToLesson1700000000011';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const lessonTable = await queryRunner.getTable('lesson');
        if (!lessonTable) return;

        // Add authorId column if it doesn't exist
        if (!lessonTable.findColumnByName('authorId')) {
            await queryRunner.addColumn(
                'lesson',
                new TableColumn({
                    name: 'authorId',
                    type: 'uuid',
                    isNullable: true,
                }),
            );
        }

        // Add isPublic column if it doesn't exist
        if (!lessonTable.findColumnByName('isPublic')) {
            await queryRunner.addColumn(
                'lesson',
                new TableColumn({
                    name: 'isPublic',
                    type: 'boolean',
                    default: true,
                    isNullable: false,
                }),
            );
        }

        // Add isProContent column if it doesn't exist
        if (!lessonTable.findColumnByName('isProContent')) {
            await queryRunner.addColumn(
                'lesson',
                new TableColumn({
                    name: 'isProContent',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                }),
            );
        }

        // Create foreign key for authorId if it doesn't exist
        const existingFk = lessonTable.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('authorId') !== -1,
        );
        if (!existingFk) {
            await queryRunner.createForeignKey(
                'lesson',
                new TableForeignKey({
                    columnNames: ['authorId'],
                    referencedTableName: 'user',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            );
        }

        // Create indexes if they don't exist
        const hasAuthorIndex = await queryRunner.query(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'lesson' AND indexname = 'IDX_lesson_authorId'
        `);
        if (hasAuthorIndex.length === 0) {
            await queryRunner.query(
                `CREATE INDEX "IDX_lesson_authorId" ON "lesson" ("authorId")`,
            );
        }

        const hasPublicIndex = await queryRunner.query(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'lesson' AND indexname = 'IDX_lesson_isPublic'
        `);
        if (hasPublicIndex.length === 0) {
            await queryRunner.query(
                `CREATE INDEX "IDX_lesson_isPublic" ON "lesson" ("isPublic")`,
            );
        }

        const hasProIndex = await queryRunner.query(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'lesson' AND indexname = 'IDX_lesson_isProContent'
        `);
        if (hasProIndex.length === 0) {
            await queryRunner.query(
                `CREATE INDEX "IDX_lesson_isProContent" ON "lesson" ("isProContent")`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_lesson_isProContent"`);
        await queryRunner.query(`DROP INDEX "IDX_lesson_isPublic"`);
        await queryRunner.query(`DROP INDEX "IDX_lesson_authorId"`);

        // Get table to find foreign key name
        const table = await queryRunner.getTable('lesson');
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('authorId') !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('lesson', foreignKey);
        }

        // Drop columns
        await queryRunner.dropColumn('lesson', 'isProContent');
        await queryRunner.dropColumn('lesson', 'isPublic');
        await queryRunner.dropColumn('lesson', 'authorId');
    }
}

