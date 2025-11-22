import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskPriorityService } from '../reference-data/task-priority.service';
import { Paginated } from '../../common/types/paginated.type';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Task, 'read-only')
    private readonly taskRepositoryReadOnly: Repository<Task>,
    private readonly taskPriorityService: TaskPriorityService,
  ) {}

  async findAll(userId: string, page?: number, pageSize?: number): Promise<Task[] | Paginated<Task>> {
    this.logger.log(`> findAll: userId=${userId}, page=${page}, pageSize=${pageSize}`);

    // If page is not provided, return all tasks (existing behavior)
    if (page === undefined) {
      const tasks = await this.taskRepositoryReadOnly.find({ where: { userId } });
      this.logger.debug(`findAll: returning ${tasks.length} tasks for user ${userId}`);
      this.logger.log(`< findAll: userId=${userId}`);
      return tasks;
    }

    // Page is provided, so return paginated results
    // Default page size to 10 if not provided
    const effectivePageSize = pageSize ?? 10;
    const skip = (page - 1) * effectivePageSize;

    // Get total count for pagination metadata
    const [tasks, totalItems] = await this.taskRepositoryReadOnly.findAndCount({
      where: { userId },
      skip,
      take: effectivePageSize,
    });

    const totalPages = Math.ceil(totalItems / effectivePageSize);

    const result: Paginated<Task> = {
      data: tasks,
      pagination: {
        page,
        pageSize: effectivePageSize,
        totalPages,
        totalItems,
      },
    };

    this.logger.debug(
      `findAll: returning ${tasks.length} tasks for user ${userId} (page ${page}, pageSize ${effectivePageSize}, totalItems ${totalItems}, totalPages ${totalPages})`,
    );
    this.logger.log(`< findAll: userId=${userId}, page=${page}, pageSize=${pageSize}`);
    return result;
  }

  async findOne(id: string, userId: string): Promise<Task> {
    this.logger.log(`> findOne: ${id}, userId=${userId}`);
    const task = await this.taskRepositoryReadOnly.findOne({ where: { id, userId } });
    this.logger.debug(`findOne: ${id} found: ${!!task} for user ${userId}`);

    if (!task) {
      this.logger.warn(`Task with ID ${id} not found for user ${userId}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    this.logger.log(`< findOne: ${id}, userId=${userId}`);
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    this.logger.log(`> create: userId=${userId}`);

    // Validate task priority exists
    try {
      await this.taskPriorityService.findOne(createTaskDto.taskPriorityCode);
    } catch {
      this.logger.warn(`Invalid task priority code: ${createTaskDto.taskPriorityCode}`);
      throw new BadRequestException(`Invalid task priority code: ${createTaskDto.taskPriorityCode}`);
    }

    const task = this.taskRepository.create({ ...createTaskDto, userId });
    const savedTask = await this.taskRepository.save(task);
    this.logger.debug(`create: created task with ID ${savedTask.id} for user ${userId}`);
    this.logger.log(`< create: userId=${userId}`);
    return savedTask;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    this.logger.log(`> update: ${id}, userId=${userId}`);
    // Verify the task exists and belongs to the user before updating
    await this.findOne(id, userId);

    // Validate task priority exists if provided
    if (updateTaskDto.taskPriorityCode) {
      try {
        await this.taskPriorityService.findOne(updateTaskDto.taskPriorityCode);
      } catch {
        this.logger.warn(`Invalid task priority code: ${updateTaskDto.taskPriorityCode}`);
        throw new BadRequestException(`Invalid task priority code: ${updateTaskDto.taskPriorityCode}`);
      }
    }

    // Extract the id from the DTO since we don't want to update it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: dtoId, dueAt, ...updateData } = updateTaskDto;

    // Convert dueAt string to Date if provided
    const taskUpdateData = {
      ...updateData,
      ...(dueAt && { dueAt: new Date(dueAt) }),
    };

    // Use repository.update() to ensure @UpdateDateColumn is triggered
    // Also ensure we only update tasks belonging to the user
    await this.taskRepository.update({ id, userId }, taskUpdateData);

    // Fetch the updated task to return with the new updatedAt timestamp
    const updatedTask = await this.findOne(id, userId);
    this.logger.debug(`update: updated task with ID ${updatedTask.id} for user ${userId}`);
    this.logger.log(`< update: ${id}, userId=${userId}`);
    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`> remove: ${id}, userId=${userId}`);
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
    this.logger.debug(`remove: removed task with ID ${id} for user ${userId}`);
    this.logger.log(`< remove: ${id}, userId=${userId}`);
  }

  async removeAll(userId?: string): Promise<number> {
    this.logger.log(`> removeAll: userId=${userId || 'all'}`);
    let queryBuilder = this.taskRepository.createQueryBuilder().delete().from(Task);

    if (userId) {
      queryBuilder = queryBuilder.where('userId = :userId', { userId });
    }

    const result = await queryBuilder.execute();
    const deletedCount = result.affected || 0;
    this.logger.debug(`removeAll: removed ${deletedCount} tasks ${userId ? `for user ${userId}` : ''}`);
    this.logger.log(`< removeAll: userId=${userId || 'all'}`);
    return deletedCount;
  }
}
