import { IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task-status.enum';

export class ChangeTaskStatusRequestDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
