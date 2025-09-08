import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetTaskParamsDto {
  @IsUUID(4, { message: 'taskId must be a valid UUID' })
  @IsNotEmpty({ message: 'taskId is required' })
  taskId: string;
}
