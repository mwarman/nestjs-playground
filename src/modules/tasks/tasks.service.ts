import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
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

  async update(id: string, taskData: Partial<Task>): Promise<Task> {
    this.logger.log(`> update: ${id}`);
    const task = await this.findOne(id);
    Object.assign(task, taskData);
    const updatedTask = await this.taskRepository.save(task);
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
