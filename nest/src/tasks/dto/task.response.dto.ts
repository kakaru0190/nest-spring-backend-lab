import { Task } from '../entities/task.entity';
import { TaskStatus } from '../entities/task-status.enum';
import { User } from '../../users/entities/user.entity';

export class TaskResponseDto {
  id!: number;
  title!: string;
  description!: string | null;
  status!: TaskStatus;
  dueDate!: Date;
  user!: {
    id: number;
    name: string;
    email: string;
  };
  createdAt!: Date;

  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.status = task.status;
    this.dueDate = task.dueDate;
    this.createdAt = task.createdAt;
    this.user = {
      id: task.assignee.id,
      name: task.assignee.name,
      email: task.assignee.email,
    };
  }
}
