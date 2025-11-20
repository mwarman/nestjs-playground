/**
 * Core Module
 * Provides application-wide services and infrastructure components imported once
 * by the AppModule.
 */
import { Module } from '@nestjs/common';

import { TypeOrmLoggerService } from './typeorm-logger.service';

@Module({
  providers: [TypeOrmLoggerService],
  exports: [TypeOrmLoggerService],
})
export class CoreModule {}
