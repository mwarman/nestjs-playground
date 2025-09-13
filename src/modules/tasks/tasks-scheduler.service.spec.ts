/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { TasksSchedulerService } from './tasks-scheduler.service';
import { TasksService } from './tasks.service';

// Mock the CronJob constructor
const mockCronJob = {
  start: jest.fn(),
};
jest.mock('cron', () => ({
  CronJob: jest.fn().mockImplementation(() => mockCronJob),
}));

describe('TasksSchedulerService', () => {
  let service: TasksSchedulerService;
  let tasksService: jest.Mocked<TasksService>;
  let configService: jest.Mocked<ConfigService>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockTasksService = {
      removeAll: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockSchedulerRegistry = {
      addCronJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksSchedulerService,
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
      ],
    }).compile();

    service = module.get<TasksSchedulerService>(TasksSchedulerService);
    tasksService = module.get(TasksService);
    configService = module.get(ConfigService);
    schedulerRegistry = module.get(SchedulerRegistry);

    // Mock the logger to avoid console output during tests
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCronJob.start.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize cron job with configuration schedule', () => {
      // Arrange
      const cronSchedule = '0 */5 * * * *';
      configService.get.mockReturnValue(cronSchedule);

      // Act
      service.onModuleInit();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('SCHEDULE_TASK_CLEANUP_CRON');
      expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith('cleanup-tasks', expect.any(Object));
      expect(mockCronJob.start).toHaveBeenCalledTimes(1);
      expect(loggerLogSpy).toHaveBeenCalledWith(`Initializing task cleanup cron job with schedule: ${cronSchedule}`);
      expect(loggerLogSpy).toHaveBeenCalledWith('Task cleanup cron job initialized and started');
    });

    it('should handle missing cron schedule configuration', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      service.onModuleInit();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('SCHEDULE_TASK_CLEANUP_CRON');
      expect(loggerLogSpy).toHaveBeenCalledWith(
        'SCHEDULE_TASK_CLEANUP_CRON not configured - task cleanup job will not be scheduled',
      );
      expect(schedulerRegistry.addCronJob).not.toHaveBeenCalled();
    });
  });

  describe('handleTaskCleanup', () => {
    it('should successfully remove all tasks and log the result', async () => {
      // Arrange
      const expectedDeletedCount = 5;
      tasksService.removeAll.mockResolvedValue(expectedDeletedCount);

      // Act
      await service.handleTaskCleanup();

      // Assert
      expect(tasksService.removeAll).toHaveBeenCalledTimes(1);
      expect(loggerLogSpy).toHaveBeenCalledWith('> handleTaskCleanup - Starting scheduled task cleanup');
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `handleTaskCleanup - Successfully removed ${expectedDeletedCount} tasks`,
      );
      expect(loggerLogSpy).toHaveBeenCalledWith('< handleTaskCleanup - Completed scheduled task cleanup');
    });

    it('should handle errors gracefully and log them', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      tasksService.removeAll.mockRejectedValue(error);

      // Act
      await service.handleTaskCleanup();

      // Assert
      expect(tasksService.removeAll).toHaveBeenCalledTimes(1);
      expect(loggerLogSpy).toHaveBeenCalledWith('> handleTaskCleanup - Starting scheduled task cleanup');
      expect(loggerErrorSpy).toHaveBeenCalledWith('handleTaskCleanup - Error occurred during task cleanup', error);
      expect(loggerLogSpy).toHaveBeenCalledWith('< handleTaskCleanup - Completed scheduled task cleanup');
    });

    it('should remove zero tasks when database is empty', async () => {
      // Arrange
      const expectedDeletedCount = 0;
      tasksService.removeAll.mockResolvedValue(expectedDeletedCount);

      // Act
      await service.handleTaskCleanup();

      // Assert
      expect(tasksService.removeAll).toHaveBeenCalledTimes(1);
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `handleTaskCleanup - Successfully removed ${expectedDeletedCount} tasks`,
      );
    });
  });
});
