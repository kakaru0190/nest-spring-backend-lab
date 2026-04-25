import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { TaskStatus } from '../entities/task-status.enum';
import { Type } from 'class-transformer';

export class FindTasksQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assigneeId!: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
