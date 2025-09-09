import { Controller, Get, HttpCode, HttpStatus, Logger, Param, ValidationPipe } from '@nestjs/common';

import type { Task } from './entities/task.entity';
import { GetTaskParamsDto } from './dto/get-task-params.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Task[] {
    this.logger.log('> findAll');
    const tasks = this.tasksService.findAll();
    this.logger.log('< findAll');
    return tasks;
  }

  @Get(':taskId')
  @HttpCode(HttpStatus.OK)
  findOne(@Param(new ValidationPipe({ transform: true })) params: GetTaskParamsDto): Task {
    this.logger.log(`> findOne: ${params.taskId}`);
    const task = this.tasksService.findOne(params.taskId);
    this.logger.log(`< findOne: ${params.taskId}`);
    return task;
  }
}
