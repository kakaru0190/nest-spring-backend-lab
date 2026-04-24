import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { Task } from './entities/task.entity';
import { TaskStatus } from './entities/task-status.enum';
import { User } from '../users/entities/user.entity';
import { ChangeTaskStatusRequestDto } from './dto/change-task-status.request.dto';

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: {
    createTask: jest.Mock;
    findTaskById: jest.Mock;
    findTaskByIdWithAssignee: jest.Mock;
    updateTaskStatus: jest.Mock;
  };
  let usersRepository: {
    findUserById: jest.Mock;
  };

  beforeEach(async () => {
    tasksRepository = {
      createTask: jest.fn(),
      findTaskById: jest.fn(),
      findTaskByIdWithAssignee: jest.fn(),
      updateTaskStatus: jest.fn(),
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
      tasksRepository.createTask.mockResolvedValue(savedTask.id);
      tasksRepository.findTaskByIdWithAssignee.mockResolvedValue(savedTask);

      const result = await tasksService.createTask(dto);

      expect(usersRepository.findUserById).toHaveBeenCalledWith(dto.userId);
      expect(tasksRepository.createTask).toHaveBeenCalledWith(dto);
      expect(tasksRepository.findTaskByIdWithAssignee).toHaveBeenCalledWith(
        savedTask.id,
      );
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

  describe('changeTaskStatus', () => {
    it('정상 처리', async () => {
      const dto: ChangeTaskStatusRequestDto = {
        status: TaskStatus.IN_PROGRESS,
      };
      const task: Task = {
        id: 1,
        title: 'task title',
        description: 'task description',
        status: TaskStatus.TODO,
        dueDate: new Date('2099-12-31T00:00:00.000Z'),
        assigneeId: 1,
        assignee: {
          id: 1,
          name: 'ys',
          email: 'ys@example.com',
          tasks: [],
          createdAt: new Date('2099-01-01T00:00:00.000Z'),
          updatedAt: new Date('2099-01-01T00:00:00.000Z'),
        },
        createdAt: new Date('2099-01-01T00:00:00.000Z'),
        updatedAt: new Date('2099-01-01T00:00:00.000Z'),
      };
      const updatedTask: Task = {
        ...task,
        status: TaskStatus.IN_PROGRESS,
      };

      tasksRepository.findTaskById.mockResolvedValue(task);
      tasksRepository.updateTaskStatus.mockResolvedValue(undefined);
      tasksRepository.findTaskByIdWithAssignee.mockResolvedValue(updatedTask);

      const result = await tasksService.changeTaskStatus(1, dto);

      expect(tasksRepository.findTaskById).toHaveBeenCalledWith(1);
      expect(tasksRepository.updateTaskStatus).toHaveBeenCalledWith(
        1,
        dto.status,
      );
      expect(tasksRepository.findTaskByIdWithAssignee).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedTask);
    });

    it('작업이 없으면 예외 처리', async () => {
      const dto: ChangeTaskStatusRequestDto = {
        status: TaskStatus.IN_PROGRESS,
      };

      tasksRepository.findTaskById.mockResolvedValue(null);

      await expect(tasksService.changeTaskStatus(1, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tasksRepository.findTaskById).toHaveBeenCalledWith(1);
      expect(tasksRepository.updateTaskStatus).not.toHaveBeenCalled();
      expect(tasksRepository.findTaskByIdWithAssignee).not.toHaveBeenCalled();
    });

    it('DONE에서 TODO로 변경하면 예외 처리', async () => {
      const dto: ChangeTaskStatusRequestDto = {
        status: TaskStatus.TODO,
      };
      const task: Task = {
        id: 1,
        title: 'task title',
        description: 'task description',
        status: TaskStatus.DONE,
        dueDate: new Date('2099-12-31T00:00:00.000Z'),
        assigneeId: 1,
        assignee: {
          id: 1,
          name: 'ys',
          email: 'ys@example.com',
          tasks: [],
          createdAt: new Date('2099-01-01T00:00:00.000Z'),
          updatedAt: new Date('2099-01-01T00:00:00.000Z'),
        },
        createdAt: new Date('2099-01-01T00:00:00.000Z'),
        updatedAt: new Date('2099-01-01T00:00:00.000Z'),
      };

      tasksRepository.findTaskById.mockResolvedValue(task);

      await expect(tasksService.changeTaskStatus(1, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(tasksRepository.findTaskById).toHaveBeenCalledWith(1);
      expect(tasksRepository.updateTaskStatus).not.toHaveBeenCalled();
      expect(tasksRepository.findTaskByIdWithAssignee).not.toHaveBeenCalled();
    });

    it('상태 변경 후 재조회 실패 시 예외 처리', async () => {
      const dto: ChangeTaskStatusRequestDto = {
        status: TaskStatus.IN_PROGRESS,
      };
      const task: Task = {
        id: 1,
        title: 'task title',
        description: 'task description',
        status: TaskStatus.TODO,
        dueDate: new Date('2099-12-31T00:00:00.000Z'),
        assigneeId: 1,
        assignee: {
          id: 1,
          name: 'ys',
          email: 'ys@example.com',
          tasks: [],
          createdAt: new Date('2099-01-01T00:00:00.000Z'),
          updatedAt: new Date('2099-01-01T00:00:00.000Z'),
        },
        createdAt: new Date('2099-01-01T00:00:00.000Z'),
        updatedAt: new Date('2099-01-01T00:00:00.000Z'),
      };

      tasksRepository.findTaskById.mockResolvedValue(task);
      tasksRepository.updateTaskStatus.mockResolvedValue(undefined);
      tasksRepository.findTaskByIdWithAssignee.mockResolvedValue(null);

      await expect(tasksService.changeTaskStatus(1, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(tasksRepository.findTaskById).toHaveBeenCalledWith(1);
      expect(tasksRepository.updateTaskStatus).toHaveBeenCalledWith(
        1,
        dto.status,
      );
      expect(tasksRepository.findTaskByIdWithAssignee).toHaveBeenCalledWith(1);
    });
  });
});
