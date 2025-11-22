import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskParamsDto } from './dto/get-task-params.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Paginated } from '../../common/types/paginated.type';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({ description: 'The task has been successfully created', type: Task })
  async create(
    @Body(new ValidationPipe({ transform: true })) createTaskDto: CreateTaskDto,
    @AuthUser('id') userId: string,
  ): Promise<Task> {
    this.logger.log('> create');
    const task = await this.tasksService.create(createTaskDto, userId);
    this.logger.log('< create');
    return task;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch all tasks or a paginated list of tasks' })
  @ApiResponse({
    status: 200,
    description: 'List of all tasks for the authenticated user, or a paginated response if page parameter is provided',
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: GetTasksQueryDto,
    @AuthUser('id') userId: string,
  ): Promise<Task[] | Paginated<Task>> {
    this.logger.log('> findAll');
    const tasks = await this.tasksService.findAll(userId, query.page, query.pageSize);
    this.logger.log('< findAll');
    return tasks;
  }

  @Get(':taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch a specific task by its ID' })
  @ApiOkResponse({ description: 'The task with the specified ID', type: Task })
  @ApiNotFoundResponse({ description: 'Task not found' })
  async findOne(
    @Param(new ValidationPipe({ transform: true })) params: GetTaskParamsDto,
    @AuthUser('id') userId: string,
  ): Promise<Task> {
    this.logger.log(`> findOne: ${params.taskId}`);
    const task = await this.tasksService.findOne(params.taskId, userId);
    this.logger.log(`< findOne: ${params.taskId}`);
    return task;
  }

  @Put(':taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a specific task by its ID' })
  @ApiOkResponse({ description: 'The task has been successfully updated', type: Task })
  @ApiNotFoundResponse({ description: 'Task not found' })
  async update(
    @Param(new ValidationPipe({ transform: true })) params: GetTaskParamsDto,
    @Body(new ValidationPipe({ transform: true })) updateTaskDto: UpdateTaskDto,
    @AuthUser('id') userId: string,
  ): Promise<Task> {
    this.logger.log(`> update: ${params.taskId}`);
    const task = await this.tasksService.update(params.taskId, updateTaskDto, userId);
    this.logger.log(`< update: ${params.taskId}`);
    return task;
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a specific task by its ID' })
  @ApiNoContentResponse({ description: 'The task has been successfully removed' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  async remove(
    @Param(new ValidationPipe({ transform: true })) params: GetTaskParamsDto,
    @AuthUser('id') userId: string,
  ): Promise<void> {
    this.logger.log(`> remove: ${params.taskId}`);
    await this.tasksService.remove(params.taskId, userId);
    this.logger.log(`< remove: ${params.taskId}`);
  }
}
