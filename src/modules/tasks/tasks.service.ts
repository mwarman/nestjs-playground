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

  async findAll(): Promise<Task[]> {
    this.logger.log('> findAll');
    const tasks = await this.taskRepository.find();
    this.logger.debug(`findAll: returning ${tasks.length} tasks`);
    this.logger.log('< findAll');
    return tasks;
  }

  async findOne(id: string): Promise<Task> {
    this.logger.log(`> findOne: ${id}`);
    const task = await this.taskRepository.findOne({ where: { id } });
    this.logger.debug(`findOne: ${id} found: ${!!task}`);

    if (!task) {
      this.logger.warn(`Task with ID ${id} not found`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    this.logger.log(`< findOne: ${id}`);
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    this.logger.log('> create');
    const task = this.taskRepository.create(createTaskDto);
    const savedTask = await this.taskRepository.save(task);
    this.logger.debug(`create: created task with ID ${savedTask.id}`);
    this.logger.log('< create');
    return savedTask;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    this.logger.log(`> update: ${id}`);
    // Verify the task exists before updating
    await this.findOne(id);

    // Extract the id from the DTO since we don't want to update it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: dtoId, dueAt, ...updateData } = updateTaskDto;

    // Convert dueAt string to Date if provided
    const taskUpdateData = {
      ...updateData,
      ...(dueAt && { dueAt: new Date(dueAt) }),
    };

    // Use repository.update() to ensure @UpdateDateColumn is triggered
    await this.taskRepository.update(id, taskUpdateData);

    // Fetch the updated task to return with the new updatedAt timestamp
    const updatedTask = await this.findOne(id);
    this.logger.debug(`update: updated task with ID ${updatedTask.id}`);
    this.logger.log(`< update: ${id}`);
    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`> remove: ${id}`);
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    this.logger.debug(`remove: removed task with ID ${id}`);
    this.logger.log(`< remove: ${id}`);
  }
}
