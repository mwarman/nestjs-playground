import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { TaskPriority } from './entities/task-priority.entity';

@Injectable()
export class TaskPriorityService {
  private readonly logger = new Logger(TaskPriorityService.name);
  private readonly CACHE_TTL = 300000; // 5 minutes in milliseconds
  private readonly CACHE_KEY_ALL = 'task-priorities:all';
  private readonly CACHE_KEY_ONE = 'task-priority:';

  constructor(
    @InjectRepository(TaskPriority)
    private readonly taskPriorityRepository: Repository<TaskPriority>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<TaskPriority[]> {
    this.logger.log('> findAll');

    // Try to get from cache first
    const cached = await this.cacheManager.get<TaskPriority[]>(this.CACHE_KEY_ALL);
    if (cached) {
      this.logger.debug(`findAll: returning ${cached.length} task priorities from cache`);
      this.logger.log('< findAll (cached)');
      return cached;
    }

    // If not in cache, fetch from database
    const taskPriorities = await this.taskPriorityRepository.find({
      order: { ordinal: 'ASC', code: 'ASC' },
    });

    // Cache the result
    await this.cacheManager.set(this.CACHE_KEY_ALL, taskPriorities, this.CACHE_TTL);

    this.logger.debug(`findAll: returning ${taskPriorities.length} task priorities from database`);
    this.logger.log('< findAll');
    return taskPriorities;
  }

  async findOne(code: string): Promise<TaskPriority> {
    this.logger.log(`> findOne: ${code}`);

    const cacheKey = `${this.CACHE_KEY_ONE}${code}`;

    // Try to get from cache first
    const cached = await this.cacheManager.get<TaskPriority>(cacheKey);
    if (cached) {
      this.logger.debug(`findOne: ${code} found in cache`);
      this.logger.log(`< findOne: ${code} (cached)`);
      return cached;
    }

    // If not in cache, fetch from database
    const taskPriority = await this.taskPriorityRepository.findOne({ where: { code } });
    this.logger.debug(`findOne: ${code} found: ${!!taskPriority}`);

    if (!taskPriority) {
      this.logger.warn(`TaskPriority with code ${code} not found`);
      throw new NotFoundException(`TaskPriority with code ${code} not found`);
    }

    // Cache the result
    await this.cacheManager.set(cacheKey, taskPriority, this.CACHE_TTL);

    this.logger.log(`< findOne: ${code}`);
    return taskPriority;
  }
}
