import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReferenceDataController } from './reference-data.controller';
import { TaskPriorityService } from './task-priority.service';
import { TaskPriority } from './entities/task-priority.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskPriority])],
  controllers: [ReferenceDataController],
  providers: [TaskPriorityService],
  exports: [TaskPriorityService], // Export service so other modules can use it
})
export class ReferenceDataModule {}
