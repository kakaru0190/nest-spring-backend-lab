import { Injectable } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserRequestDto): Promise<User> {
    // TODO - 이메일 중복 확인 코드추가
    return this.usersRepository.createUser(dto);
  }
}
