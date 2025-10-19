import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskPriorityTable1760869368144 implements MigrationInterface {
  name = 'CreateTaskPriorityTable1760869368144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_priority" ("code" character varying(32) NOT NULL, "label" character varying(50) NOT NULL, "description" character varying(500) NOT NULL, "ordinal" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_task_priority_code" PRIMARY KEY ("code"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_priority"`);
  }
}
