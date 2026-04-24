import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { TaskStatus } from './entities/task-status.enum';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async findTaskById(taskId: number): Promise<Task | null> {
    return this.tasksRepository.findOne({
      where: { id: taskId },
    });
  }

  async findTaskByIdWithAssignee(taskId: number): Promise<Task | null> {
    return this.tasksRepository.findOne({
      where: { id: taskId },
      relations: {
        assignee: true,
      },
    });
  }

  async createTask(dto: CreateTaskRequestDto): Promise<number> {
    const result = await this.tasksRepository.insert({
      title: dto.title,
      description: dto.description ?? null,
      status: TaskStatus.TODO,
      dueDate: dto.dueDate,
      assigneeId: dto.userId,
    });
    return result.identifiers[0].id;
  }

  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<void> {
    await this.tasksRepository.update({ id: taskId }, { status });
  }
}
