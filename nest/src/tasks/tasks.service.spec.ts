import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { Task } from './entities/task.entity';
import { TaskStatus } from './entities/task-status.enum';
import { User } from '../users/entities/user.entity';

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: {
    createTask: jest.Mock;
  };
  let usersRepository: {
    findUserById: jest.Mock;
  };

  beforeEach(async () => {
    tasksRepository = {
      createTask: jest.fn(),
    };

    usersRepository = {
      findUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: tasksRepository,
        },
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  describe('createTask', () => {
    it('정상 처리', async () => {
      const dto: CreateTaskRequestDto = {
        title: 'task title',
        description: 'task description',
        dueDate: new Date('2099-12-31T00:00:00.000Z'),
        userId: 1,
      };
      const user: User = {
        id: 1,
        name: 'ys',
        email: 'ys@example.com',
        tasks: [],
        createdAt: new Date('2099-01-01T00:00:00.000Z'),
        updatedAt: new Date('2099-01-01T00:00:00.000Z'),
      };
      const savedTask: Task = {
        id: 1,
        title: 'task title',
        description: 'task description',
        status: TaskStatus.TODO,
        dueDate: new Date('2099-12-31T00:00:00.000Z'),
        assigneeId: 1,
        assignee: user,
        createdAt: new Date('2099-01-01T00:00:00.000Z'),
        updatedAt: new Date('2099-01-01T00:00:00.000Z'),
      };

      usersRepository.findUserById.mockResolvedValue(user);
      tasksRepository.createTask.mockResolvedValue(savedTask);

      const result = await tasksService.createTask(dto);

      expect(usersRepository.findUserById).toHaveBeenCalledWith(dto.userId);
      expect(tasksRepository.createTask).toHaveBeenCalledWith(dto);
      expect(result).toEqual(savedTask);
    });

    it('과거 마감일이면 예외 처리', async () => {
      const dto: CreateTaskRequestDto = {
        title: 'task title',
        description: 'task description',
        dueDate: new Date('2000-01-01T00:00:00.000Z'),
        userId: 1,
      };

      await expect(tasksService.createTask(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(usersRepository.findUserById).not.toHaveBeenCalled();
      expect(tasksRepository.createTask).not.toHaveBeenCalled();
    });

    it('담당자 유저가 없으면 예외 처리', async () => {
      const dto: CreateTaskRequestDto = {
        title: 'task title',
        description: 'task description',
        dueDate: new Date('2099-12-31T00:00:00.000Z'),
        userId: 1,
      };

      usersRepository.findUserById.mockResolvedValue(null);

      await expect(tasksService.createTask(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersRepository.findUserById).toHaveBeenCalledWith(dto.userId);
      expect(tasksRepository.createTask).not.toHaveBeenCalled();
    });
  });
});
