import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVersionToPractice1700000000003 implements MigrationInterface {
    name = 'AddVersionToPractice1700000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practice" ADD "version" integer NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practice" DROP COLUMN "version"`);
    }
}
