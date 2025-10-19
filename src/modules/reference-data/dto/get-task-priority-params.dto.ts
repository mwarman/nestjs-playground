import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class GetTaskPriorityParamsDto {
  @ApiProperty({
    name: 'code',
    description: 'Unique code identifier for the task priority',
    example: 'HIGH',
    maxLength: 32,
  })
  @IsString({ message: 'code must be a string' })
  @IsNotEmpty({ message: 'code is required' })
  @MaxLength(32, { message: 'code must not exceed 32 characters' })
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'code must contain only uppercase letters, numbers, underscores, and hyphens',
  })
  code: string;
}
