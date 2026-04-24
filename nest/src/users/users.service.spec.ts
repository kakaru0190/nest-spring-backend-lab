import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { CreateUserRequestDto } from './dto/create-user.request.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: {
    createUser: jest.Mock;
    findUserByEmail: jest.Mock;
    findUserById: jest.Mock;
  };

  beforeEach(async () => {
    usersRepository = {
      createUser: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('정상 처리', async () => {
      const dto: CreateUserRequestDto = {
        name: 'ys',
        email: 'ys@example.com',
      };
      const savedUser = {
        id: 1,
        name: 'ys',
        email: 'ys@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersRepository.findUserByEmail.mockResolvedValue(null);
      usersRepository.createUser.mockResolvedValue(savedUser);

      const result = await usersService.createUser(dto);

      expect(usersRepository.findUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersRepository.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(savedUser);
    });

    it('중복 이메일 처리', async () => {
      const dto: CreateUserRequestDto = {
        name: 'ys',
        email: 'ys@example.com',
      };
      const existingUser = {
        id: 1,
        name: 'existing',
        email: 'ys@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersRepository.findUserByEmail.mockResolvedValue(existingUser);

      await expect(usersService.createUser(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersRepository.findUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('findUser', () => {
    it('정상 처리', async () => {
      const user = {
        id: 1,
        name: 'ys',
        email: 'ys@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersRepository.findUserById.mockResolvedValue(user);

      const result = await usersService.findUser(1);

      expect(usersRepository.findUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it('id로 유저 찾지못한 경우', async () => {
      usersRepository.findUserById.mockResolvedValue(null);

      await expect(usersService.findUser(1)).rejects.toThrow(NotFoundException);
      expect(usersRepository.findUserById).toHaveBeenCalledWith(1);
    });
  });
});
