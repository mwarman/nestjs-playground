import { Controller, Get, HttpCode, HttpStatus, Param, ValidationPipe } from '@nestjs/common';

import type { Task } from './entities/task.entity';
import { GetTaskParamsDto } from './dto/get-task-params.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  @Get(':taskId')
  @HttpCode(HttpStatus.OK)
  findOne(@Param(new ValidationPipe({ transform: true })) params: GetTaskParamsDto): Task {
    return this.tasksService.findOne(params.taskId);
  }
}
