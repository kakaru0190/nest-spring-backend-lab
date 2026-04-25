import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { TasksRepository } from './tasks.repository';
import { Task } from './entities/task.entity';
import { UsersRepository } from '../users/users.repository';
import { ChangeTaskStatusRequestDto } from './dto/change-task-status.request.dto';
import { TaskStatus } from './entities/task-status.enum';
import { FindTasksQueryDto } from './dto/find-tasks.query.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findTasks(query: FindTasksQueryDto): Promise<Task[]> {
    return this.tasksRepository.findTasksByCondition(
      query.assigneeId,
      query.status,
    );
  }

  async createTask(dto: CreateTaskRequestDto): Promise<Task> {
    if (dto.dueDate.getTime() < Date.now()) {
      throw new BadRequestException('Due date cannot be in the past');
    }

    const user = await this.usersRepository.findUserById(dto.userId);

    if (!user) {
      throw new NotFoundException(`User with id ${dto.userId} not found`);
    }

    const taskId = await this.tasksRepository.createTask(dto);

    const task = await this.tasksRepository.findTaskByIdWithAssignee(taskId);

    if (!task) {
      throw new InternalServerErrorException(
        'Task was created but could not be loaded',
      );
    }

    return task;
  }

  async changeTaskStatus(
    taskId: number,
    dto: ChangeTaskStatusRequestDto,
  ): Promise<Task> {
    // TODO - 나중에 본인 Task만 변경할 수 있도록 처리해야함
    const task = await this.tasksRepository.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    if (task.status === TaskStatus.DONE && dto.status === TaskStatus.TODO) {
      throw new BadRequestException(
        'Cannot change task status from DONE to TODO',
      );
    }

    await this.tasksRepository.updateTaskStatus(taskId, dto.status);

    const updatedTask =
      await this.tasksRepository.findTaskByIdWithAssignee(taskId);

    if (!updatedTask) {
      throw new InternalServerErrorException(
        'Task status was updated but could not be loaded',
      );
    }

    return updatedTask;
  }
}
