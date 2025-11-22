/**
 * Tasks Module
 *
 * This module handles all task-related functionalities, including task creation,
 * management, and scheduling. It integrates with the Reference Data Module for
 * additional data requirements.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksSchedulerService } from './tasks-scheduler.service';
import { Task } from './entities/task.entity';
import { ReferenceDataModule } from '../reference-data/reference-data.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), TypeOrmModule.forFeature([Task], 'read-only'), ReferenceDataModule],
  controllers: [TasksController],
  providers: [TasksService, TasksSchedulerService],
})
export class TasksModule {}
