import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskPriorityCodeToTask1761994740000 implements MigrationInterface {
  name = 'AddTaskPriorityCodeToTask1761994740000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the taskPriorityCode column to the task table
    await queryRunner.query(`
      ALTER TABLE "task" 
      ADD COLUMN "taskPriorityCode" character varying(32) NOT NULL DEFAULT 'MEDIUM'
    `);

    // Update existing tasks to have a default priority (assuming MEDIUM exists)
    await queryRunner.query(`
      UPDATE "task" 
      SET "taskPriorityCode" = 'MEDIUM' 
      WHERE "taskPriorityCode" IS NULL
    `);

    // Remove the default constraint after populating existing data
    await queryRunner.query(`
      ALTER TABLE "task" 
      ALTER COLUMN "taskPriorityCode" DROP DEFAULT
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "task" 
      ADD CONSTRAINT "FK_task_taskPriorityCode" 
      FOREIGN KEY ("taskPriorityCode") 
      REFERENCES "task_priority"("code") 
      ON DELETE RESTRICT 
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "task" 
      DROP CONSTRAINT "FK_task_taskPriorityCode"
    `);

    // Drop the taskPriorityCode column
    await queryRunner.query(`
      ALTER TABLE "task" 
      DROP COLUMN "taskPriorityCode"
    `);
  }
}
