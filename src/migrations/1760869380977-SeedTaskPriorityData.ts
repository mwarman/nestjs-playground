import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTaskPriorityData1760869380977 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
INSERT INTO "task_priority" ("code", "label", "description", "ordinal") VALUES
('URGENT', 'Urgent Priority', 'Critical tasks that must be completed immediately to prevent system failure or significant business impact', 1),
('HIGH', 'High Priority', 'Tasks that require immediate attention and should be completed first within the current sprint', 2),
('MEDIUM', 'Medium Priority', 'Tasks with moderate importance that should be completed after high priority items', 3),
('LOW', 'Low Priority', 'Tasks that can be completed when time permits and do not impact critical functionality', 4),
('BACKLOG', 'Backlog Priority', 'Tasks that have been identified but are not yet prioritized for development', 5)
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DELETE FROM "task_priority" WHERE "code" IN (
'URGENT',
'HIGH',
'MEDIUM',
'LOW',
'BACKLOG'
)
`);
  }
}
