import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { TaskPriority } from '../../reference-data/entities/task-priority.entity';

/**
 * Represents a task in the system.
 *
 * Tasks are work items that can be tracked for completion with optional
 * due dates and descriptions. Each task maintains audit information about
 * when it was created and last updated.
 *
 * Note: Optional fields (description, dueAt) that are null in the database
 * will be excluded from JSON serialization to provide cleaner API responses.
 */
@Entity()
export class Task {
  /**
   * Unique identifier for the task.
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Identifier for the task' })
  @PrimaryGeneratedColumn('uuid')
  id: string; // a UUID

  /**
   * Brief description of what the task entails.
   * @example "Complete project documentation"
   */
  @ApiProperty({ example: 'Complete project documentation', description: 'Brief description of the task' })
  @Column({ type: 'varchar', length: 500 })
  summary: string;

  /**
   * Optional detailed description providing more context about the task.
   * @example "Write comprehensive documentation for the NestJS playground project"
   */
  @ApiProperty({
    example: 'Write comprehensive documentation for the NestJS playground project',
    description: 'Detailed description of the task',
    required: false,
  })
  @Transform(({ value }) => (value === null ? undefined : value))
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Optional due date for task completion.
   * @example "2025-09-15T10:00:00.000Z"
   */
  @ApiProperty({
    example: '2025-09-15T10:00:00.000Z',
    description: 'Optional due date for task completion',
    required: false,
  })
  @Transform(({ value }) => (value === null ? undefined : value))
  @Column({ type: 'timestamp with time zone', nullable: true })
  dueAt?: Date; // Changed to Date type for better TypeORM integration

  /**
   * Indicates whether the task has been completed.
   * @example false
   */
  @ApiProperty({ example: false, description: 'Indicates if the task is complete', default: false })
  @Column({ type: 'boolean', default: false })
  isComplete: boolean;

  /**
   * The unique identifier of the user who owns this task.
   * @example "550e8400-e29b-41d4-a716-446655440002"
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Unique identifier of the user who owns this task',
  })
  @Column({ type: 'uuid' })
  userId: string;

  /**
   * The user who owns this task.
   */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * The priority code for this task.
   * @example "HIGH"
   */
  @ApiProperty({
    example: 'HIGH',
    description: 'Priority code for the task',
  })
  @Column({ type: 'varchar', length: 32 })
  taskPriorityCode: string;

  /**
   * The priority for this task.
   */
  @ManyToOne(() => TaskPriority, { nullable: false, eager: true })
  @JoinColumn({ name: 'taskPriorityCode' })
  taskPriority: TaskPriority;

  /**
   * Timestamp when the task was created.
   * @example "2025-09-01T08:00:00.000Z"
   */
  @ApiProperty({ example: '2025-09-01T08:00:00.000Z', description: 'Timestamp when the task was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date; // Changed to Date type for better TypeORM integration

  /**
   * Optional timestamp when the task was last updated.
   * @example "2025-09-02T09:30:00.000Z"
   */
  @ApiProperty({
    example: '2025-09-02T09:30:00.000Z',
    description: 'Timestamp when the task was last updated',
    required: false,
  })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date; // Changed to Date type for better TypeORM integration
}
