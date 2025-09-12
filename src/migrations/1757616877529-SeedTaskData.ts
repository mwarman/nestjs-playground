import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTaskData1757616877529 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
INSERT INTO "task" ("id", "summary", "description", "dueAt", "isComplete", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Complete project documentation', 'Write comprehensive documentation for the NestJS playground project', '2025-09-15T10:00:00.000Z', false, '2025-09-01T08:00:00.000Z', '2025-09-02T09:30:00.000Z'),
('550e8400-e29b-41d4-a716-446655440002', 'Review code quality', 'Perform code review and ensure adherence to coding standards', NULL, true, '2025-08-28T14:00:00.000Z', '2025-09-01T16:45:00.000Z'),
('550e8400-e29b-41d4-a716-446655440003', 'Setup CI/CD pipeline', NULL, '2025-09-20T12:00:00.000Z', false, '2025-09-03T10:15:00.000Z', '2025-09-03T10:15:00.000Z'),
('550e8400-e29b-41d4-a716-446655440004', 'Update dependencies', 'Update all npm packages to latest stable versions', NULL, false, '2025-09-05T11:30:00.000Z', '2025-09-06T13:20:00.000Z')
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DELETE FROM "task" WHERE "id" IN (
'550e8400-e29b-41d4-a716-446655440001',
'550e8400-e29b-41d4-a716-446655440002', 
'550e8400-e29b-41d4-a716-446655440003',
'550e8400-e29b-41d4-a716-446655440004'
)
`);
  }
}
