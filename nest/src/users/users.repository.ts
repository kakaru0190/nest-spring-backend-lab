import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/create-user.request.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserRequestDto): Promise<User> {
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
    });
    return this.usersRepository.save(user);
  }

  async findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }
}
