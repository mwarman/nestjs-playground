import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { TasksService } from './tasks.service';

/**
 * TasksSchedulerService
 *
 * This service provides optional scheduled task cleanup functionality using cron jobs.
 * It conditionally registers a cron job based on configuration to automatically
 * remove all tasks from the database at specified intervals.
 *
 * Configuration:
 * - SCHEDULE_TASK_CLEANUP_CRON: Optional cron expression (6-field format)
 * - If not configured, the cleanup job will not be scheduled
 * - When configured, creates and starts a cron job that calls TasksService.removeAll()
 *
 * Examples:
 * - "0 * * * * *" - Every minute
 * - "0 0 * * * *" - Every hour
 * - "0 0 0 * * *" - Every day at midnight
 *
 * The service logs its initialization status and cleanup results for monitoring.
 */
@Injectable()
export class TasksSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(TasksSchedulerService.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Conditionally initializes the task cleanup cron job based on configuration.
   *
   * This method is called automatically by NestJS when the module is initialized.
   * It checks for the SCHEDULE_TASK_CLEANUP_CRON environment variable and:
   * - If present: Creates, registers, and starts a cron job for task cleanup
   * - If absent: Logs that the feature is disabled and continues without scheduling
   *
   * The conditional behavior allows deployments to optionally enable/disable
   * automatic task cleanup without code changes.
   */
  onModuleInit() {
    // Check if cron schedule is configured via environment variable
    const taskCleanupCron = this.configService.get<string>('SCHEDULE_TASK_CLEANUP_CRON');
    if (!taskCleanupCron) {
      // Feature is disabled - log and exit early
      this.logger.log('SCHEDULE_TASK_CLEANUP_CRON not configured - task cleanup job will not be scheduled');
      return;
    }

    this.logger.log(`Initializing task cleanup cron job with schedule: ${taskCleanupCron}`);

    // Create cron job that will call our cleanup handler
    const job = new CronJob(taskCleanupCron, () => {
      void this.handleTaskCleanup();
    });

    // Register the job with NestJS scheduler and start it
    this.schedulerRegistry.addCronJob('cleanup-tasks', job);
    job.start();

    this.logger.log('Task cleanup cron job initialized and started');
  }

  /**
   * Executes the scheduled task cleanup operation.
   *
   * This method is called automatically by the cron job at the configured intervals.
   * It performs the following operations:
   * 1. Logs the start of the cleanup process
   * 2. Calls TasksService.removeAll() to delete all tasks from the database
   * 3. Logs the number of tasks successfully removed
   * 4. Handles and logs any errors that occur during cleanup
   * 5. Logs the completion of the cleanup process
   *
   * Error handling ensures that failures don't crash the application and
   * all cleanup attempts are logged for monitoring and debugging.
   */
  async handleTaskCleanup(): Promise<void> {
    this.logger.log('> handleTaskCleanup - Starting scheduled task cleanup');

    try {
      // Remove all tasks from the database
      const deletedCount = await this.tasksService.removeAll();
      this.logger.log(`handleTaskCleanup - Successfully removed ${deletedCount} tasks`);
    } catch (error) {
      // Log errors but don't throw - keeps the cron job running
      this.logger.error('handleTaskCleanup - Error occurred during task cleanup', error);
    }

    this.logger.log('< handleTaskCleanup - Completed scheduled task cleanup');
  }
}
