import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { TasksRepository } from './tasks.repository';
import { Task } from './entities/task.entity';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createTask(dto: CreateTaskRequestDto): Promise<Task> {
    if (dto.dueDate.getTime() < Date.now()) {
      throw new BadRequestException('Due date cannot be in the past');
    }

    const user = await this.usersRepository.findUserById(dto.userId);

    if (!user) {
      throw new NotFoundException(`User with id ${dto.userId} not found`);
    }

    return this.tasksRepository.createTask(dto);
  }
}
