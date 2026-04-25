import { TaskStatus } from '../entities/task-status.enum';
import { Task } from '../entities/task.entity';

export class TaskListItemResponseDto {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.status = task.status;
    this.dueDate = task.dueDate;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;
  }
}
