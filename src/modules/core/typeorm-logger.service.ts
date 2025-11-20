import { Injectable, Logger } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';

/**
 * Custom TypeORM Logger Service
 * Integrates TypeORM logging with NestJS Logger for consistent logging format
 * and levels across the application.
 */
@Injectable()
export class TypeOrmLoggerService implements TypeOrmLogger {
  private readonly logger = new Logger('TypeORM');

  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    const formattedQuery = this.formatQuery(query, parameters);
    this.logger.debug(`Query: ${formattedQuery}`);
  }

  logQueryError(error: string | Error, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    const formattedQuery = this.formatQuery(query, parameters);
    const errorMessage = error instanceof Error ? error.message : error;
    this.logger.error(`Query failed: ${formattedQuery} | Error: ${errorMessage}`);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    const formattedQuery = this.formatQuery(query, parameters);
    this.logger.warn(`Slow query (${time}ms): ${formattedQuery}`);
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    this.logger.log(`Schema build: ${message}`);
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    this.logger.log(`Migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any, _queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        this.logger.log(message);
        break;
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }

  private formatQuery(query: string, parameters?: any[]): string {
    if (!parameters || parameters.length === 0) {
      return query;
    }
    return `${query} -- Parameters: [${parameters.map((p) => JSON.stringify(p)).join(', ')}]`;
  }
}
