/**
 * Represents a task in the system.
 *
 * Tasks are work items that can be tracked for completion with optional
 * due dates and descriptions. Each task maintains audit information about
 * when it was created and last updated.
 */
export interface Task {
  /**
   * Unique identifier for the task.
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  id: string; // a UUID

  /**
   * Brief description of what the task entails.
   * @example "Complete project documentation"
   */
  summary: string;

  /**
   * Optional detailed description providing more context about the task.
   * @example "Write comprehensive documentation for the NestJS playground project"
   */
  description?: string;

  /**
   * Optional due date for task completion.
   * @example "2025-09-15T10:00:00.000Z"
   */
  dueAt?: string; // an ISO8601 timestamp

  /**
   * Indicates whether the task has been completed.
   * @example false
   */
  isComplete: boolean;

  /**
   * Timestamp when the task was created.
   * @example "2025-09-01T08:00:00.000Z"
   */
  createdAt: string; // an ISO8601 timestamp when the task was created

  /**
   * Optional timestamp when the task was last updated.
   * @example "2025-09-02T09:30:00.000Z"
   */
  updatedAt?: string; // an ISO8601 timestamp when the task was last updated
}
