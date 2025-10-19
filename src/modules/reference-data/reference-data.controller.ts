import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TaskPriority } from './entities/task-priority.entity';
import { GetTaskPriorityParamsDto } from './dto/get-task-priority-params.dto';
import { TaskPriorityService } from './task-priority.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Reference Data')
@Public() // Reference data endpoints are public
@UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
@Controller({ path: 'refdata', version: '1' })
export class ReferenceDataController {
  private readonly logger = new Logger(ReferenceDataController.name);

  constructor(private readonly taskPriorityService: TaskPriorityService) {}

  @Get('taskpriorities')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(300000) // Cache for 5 minutes (300,000 ms)
  @ApiOperation({ summary: 'Fetch all task priority levels' })
  @ApiOkResponse({ description: 'List of all task priority levels', type: [TaskPriority] })
  async getTaskPriorities(): Promise<TaskPriority[]> {
    this.logger.log('> getTaskPriorities');
    const taskPriorities = await this.taskPriorityService.findAll();
    this.logger.log('< getTaskPriorities');
    return taskPriorities;
  }

  @Get('taskpriorities/:code')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(300000) // Cache for 5 minutes (300,000 ms)
  @ApiOperation({ summary: 'Fetch a specific task priority level by its code' })
  @ApiOkResponse({ description: 'The task priority level with the specified code', type: TaskPriority })
  @ApiNotFoundResponse({ description: 'Task priority level not found' })
  async getTaskPriority(
    @Param(new ValidationPipe({ transform: true })) params: GetTaskPriorityParamsDto,
  ): Promise<TaskPriority> {
    this.logger.log(`> getTaskPriority: ${params.code}`);
    const taskPriority = await this.taskPriorityService.findOne(params.code);
    this.logger.log(`< getTaskPriority: ${params.code}`);
    return taskPriority;
  }
}
