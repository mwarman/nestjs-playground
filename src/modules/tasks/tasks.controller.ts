import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskParamsDto } from './dto/get-task-params.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@ApiTags('Tasks')
@UseInterceptors(ClassSerializerInterceptor)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({ description: 'The task has been successfully created', type: Task })
  async create(@Body(new ValidationPipe({ transform: true })) createTaskDto: CreateTaskDto): Promise<Task> {
    this.logger.log('> create');
    const task = await this.tasksService.create(createTaskDto);
    this.logger.log('< create');
    return task;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all tasks' })
  @ApiResponse({ status: 200, description: 'List of all tasks', type: [Task] })
  async findAll(): Promise<Task[]> {
    this.logger.log('> findAll');
    const tasks = await this.tasksService.findAll();
    this.logger.log('< findAll');
    return tasks;
  }

  @Get(':taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch a specific task by its ID' })
  @ApiOkResponse({ description: 'The task with the specified ID', type: Task })
  @ApiNotFoundResponse({ description: 'Task not found' })
  async findOne(@Param(new ValidationPipe({ transform: true })) params: GetTaskParamsDto): Promise<Task> {
    this.logger.log(`> findOne: ${params.taskId}`);
    const task = await this.tasksService.findOne(params.taskId);
    this.logger.log(`< findOne: ${params.taskId}`);
    return task;
  }
}
