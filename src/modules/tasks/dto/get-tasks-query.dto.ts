import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetTasksQueryDto {
  /**
   * Page number for pagination. If provided, the API will return paginated results.
   * If not provided, all tasks will be returned.
   * @example 1
   */
  @ApiProperty({
    example: 1,
    description: 'Page number for pagination (1-indexed). If omitted, all tasks are returned.',
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number;

  /**
   * Number of tasks to return per page. Defaults to 10 if page is specified but pageSize is not.
   * @example 10
   */
  @ApiProperty({
    example: 10,
    description: 'Number of tasks per page. Defaults to 10 if not provided when page is specified.',
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize must be an integer' })
  @Min(1, { message: 'pageSize must be at least 1' })
  pageSize?: number;
}
