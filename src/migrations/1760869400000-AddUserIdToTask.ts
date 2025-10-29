import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToTask1760869400000 implements MigrationInterface {
  name = 'AddUserIdToTask1760869400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add userId column to task table
    await queryRunner.query(`ALTER TABLE "task" ADD "userId" uuid NOT NULL`);

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Add index for better query performance
    await queryRunner.query(`CREATE INDEX "IDX_f316d3fe53497d4d8a2957db8b9" ON "task" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_f316d3fe53497d4d8a2957db8b9"`);

    // Drop foreign key constraint
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9"`);

    // Drop userId column
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "userId"`);
  }
}
