import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateTaskDto {
  /**
   * Unique identifier for the task being updated.
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Unique identifier for the task',
  })
  @IsString({ message: 'id must be a string' })
  @IsNotEmpty({ message: 'id is required' })
  @IsUUID(4, { message: 'id must be a valid UUID' })
  id: string;

  /**
   * Brief description of what the task entails.
   * @example "Complete project documentation"
   */
  @ApiProperty({
    example: 'Complete project documentation',
    description: 'Brief description of the task',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'summary must be a string' })
  @IsNotEmpty({ message: 'summary cannot be empty when provided' })
  @MaxLength(500, { message: 'summary must not exceed 500 characters' })
  summary?: string;

  /**
   * Optional detailed description providing more context about the task.
   * @example "Write comprehensive documentation for the NestJS playground project"
   */
  @ApiProperty({
    example: 'Write comprehensive documentation for the NestJS playground project',
    description: 'Detailed description of the task',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
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
  @IsOptional()
  @IsDateString({}, { message: 'dueAt must be a valid ISO 8601 date string' })
  dueAt?: string;

  /**
   * Indicates whether the task has been completed.
   * @example false
   */
  @ApiProperty({
    example: false,
    description: 'Indicates if the task is complete',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isComplete must be a boolean' })
  isComplete?: boolean;

  /**
   * Priority code for the task.
   * @example "HIGH"
   */
  @ApiProperty({
    example: 'HIGH',
    description: 'Priority code for the task',
    maxLength: 32,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'taskPriorityCode must be a string' })
  @IsNotEmpty({ message: 'taskPriorityCode cannot be empty when provided' })
  @MaxLength(32, { message: 'taskPriorityCode must not exceed 32 characters' })
  taskPriorityCode?: string;
}
