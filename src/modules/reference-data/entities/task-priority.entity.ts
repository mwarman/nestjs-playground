import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Represents a task priority level in the system.
 *
 * Task priorities define the relative importance and urgency of tasks,
 * providing a standardized way to categorize and order work items.
 * Each priority has a unique code, descriptive label, and ordinal value
 * for sorting purposes.
 */
@Entity()
export class TaskPriority {
  /**
   * Unique code identifier for the task priority.
   * @example "HIGH"
   */
  @ApiProperty({
    example: 'HIGH',
    description: 'Unique code identifier for the task priority',
    maxLength: 32,
  })
  @PrimaryColumn({ type: 'varchar', length: 32 })
  code: string;

  /**
   * Human-readable label for the task priority.
   * @example "High Priority"
   */
  @ApiProperty({
    example: 'High Priority',
    description: 'Human-readable label for the task priority',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50 })
  label: string;

  /**
   * Detailed description of what this priority level represents.
   * @example "Tasks that require immediate attention and should be completed first"
   */
  @ApiProperty({
    example: 'Tasks that require immediate attention and should be completed first',
    description: 'Detailed description of the priority level',
    maxLength: 500,
  })
  @Column({ type: 'varchar', length: 500 })
  description: string;

  /**
   * Sort order for displaying priorities.
   * Lower values appear first when sorting in ascending order.
   * @example 1
   */
  @ApiProperty({
    example: 1,
    description: 'Sort order for displaying priorities',
    default: 0,
  })
  @Column({ type: 'integer', default: 0 })
  ordinal: number;
}
