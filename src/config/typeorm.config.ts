/**
 * TypeORM Migration Configuration
 * ------------------------------
 * This file sets up the TypeORM DataSource for running migrations only.
 *
 * - Not used by the NestJS application runtime.
 * - Used by TypeORM CLI and scripts for database migrations.
 * - Loads environment variables using dotenv and @nestjs/config.
 * - Uses ConfigService to read DB connection settings (host, port, user, password, database).
 * - Configures entities and migrations paths for TypeORM.
 * - Synchronize is disabled for safety in production.
 * - Logging is enabled for debugging queries and migrations.
 *
 * Usage:
 *   - Update your .env file with DB_* variables as needed.
 *   - Entities should be placed in src/modules/[feature]/entities/.
 *   - Migrations should be placed in src/migrations/.
 *   - This config is imported by TypeORM CLI for migration commands.
 *   - See package.json scripts for migration commands.
 */
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USER', 'nestuser'),
  password: configService.get('DB_PASS', 'nestpassword'),
  database: configService.get('DB_DATABASE', 'nestdb'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
