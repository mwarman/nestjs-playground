import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1757616900000 implements MigrationInterface {
  name = 'CreateUserTable1757616900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sub" uuid NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "username" character varying(50) NOT NULL,
        "passwordSalt" character varying(255) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_sub" UNIQUE ("sub"),
        CONSTRAINT "UQ_user_username" UNIQUE ("username")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IX_user_sub" ON "user" ("sub")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IX_user_username" ON "user" ("username")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IX_user_username"`);
    await queryRunner.query(`DROP INDEX "IX_user_sub"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
