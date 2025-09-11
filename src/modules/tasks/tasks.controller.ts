import { Controller, Get, HttpCode, HttpStatus, Logger, Param, ValidationPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Task } from './entities/task.entity';
import { GetTaskParamsDto } from './dto/get-task-params.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@ApiTags('Tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all tasks' })
  @ApiResponse({ status: 200, description: 'List of all tasks', type: [Task] })
  findAll(): Task[] {
    this.logger.log('> findAll');
    const tasks = this.tasksService.findAll();
    this.logger.log('< findAll');
    return tasks;
  }

  @Get(':taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch a specific task by its ID' })
  @ApiOkResponse({ description: 'The task with the specified ID', type: Task })
  @ApiNotFoundResponse({ description: 'Task not found' })
  findOne(@Param(new ValidationPipe({ transform: true })) params: GetTaskParamsDto): Task {
    this.logger.log(`> findOne: ${params.taskId}`);
    const task = this.tasksService.findOne(params.taskId);
    this.logger.log(`< findOne: ${params.taskId}`);
    return task;
  }
}
