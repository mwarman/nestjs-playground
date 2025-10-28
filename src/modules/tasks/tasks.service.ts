import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(userId: string): Promise<Task[]> {
    this.logger.log(`> findAll: userId=${userId}`);
    const tasks = await this.taskRepository.find({ where: { userId } });
    this.logger.debug(`findAll: returning ${tasks.length} tasks for user ${userId}`);
    this.logger.log(`< findAll: userId=${userId}`);
    return tasks;
  }

  async findOne(id: string, userId: string): Promise<Task> {
    this.logger.log(`> findOne: ${id}, userId=${userId}`);
    const task = await this.taskRepository.findOne({ where: { id, userId } });
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
