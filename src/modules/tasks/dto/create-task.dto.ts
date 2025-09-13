import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  /**
   * Brief description of what the task entails.
   * @example "Complete project documentation"
   */
  @ApiProperty({
    example: 'Complete project documentation',
    description: 'Brief description of the task',
    maxLength: 500,
  })
  @IsString({ message: 'summary must be a string' })
  @IsNotEmpty({ message: 'summary is required' })
  @MaxLength(500, { message: 'summary must not exceed 500 characters' })
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
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isComplete must be a boolean' })
  isComplete?: boolean;
}
