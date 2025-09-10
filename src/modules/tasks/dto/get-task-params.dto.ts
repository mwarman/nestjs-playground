import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetTaskParamsDto {
  @ApiProperty({
    name: 'taskId',
    description: 'Identifier for a task',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID(4, { message: 'taskId must be a valid UUID' })
  @IsNotEmpty({ message: 'taskId is required' })
  taskId: string;
}
