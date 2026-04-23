import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserRequestDto): Promise<User> {
    const existingUser = await this.usersRepository.findUserByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(`Email ${dto.email} already exists`);
    }

    return this.usersRepository.createUser(dto);
  }

  async findUser(id: number): Promise<User> {
    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
}
