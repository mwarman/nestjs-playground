import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskPriority } from './entities/task-priority.entity';

@Injectable()
export class TaskPriorityService {
  private readonly logger = new Logger(TaskPriorityService.name);

  constructor(
    @InjectRepository(TaskPriority)
    private readonly taskPriorityRepository: Repository<TaskPriority>,
  ) {}

  async findAll(): Promise<TaskPriority[]> {
    this.logger.log('> findAll');
    const taskPriorities = await this.taskPriorityRepository.find({
      order: { ordinal: 'ASC', code: 'ASC' },
    });
    this.logger.debug(`findAll: returning ${taskPriorities.length} task priorities`);
    this.logger.log('< findAll');
    return taskPriorities;
  }

  async findOne(code: string): Promise<TaskPriority> {
    this.logger.log(`> findOne: ${code}`);
    const taskPriority = await this.taskPriorityRepository.findOne({ where: { code } });
    this.logger.debug(`findOne: ${code} found: ${!!taskPriority}`);

    if (!taskPriority) {
      this.logger.warn(`TaskPriority with code ${code} not found`);
      throw new NotFoundException(`TaskPriority with code ${code} not found`);
    }
    this.logger.log(`< findOne: ${code}`);
    return taskPriority;
  }
}
