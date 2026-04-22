import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원 생성
  @Post()
  async createUser(@Body() dto: CreateUserRequestDto): Promise<User> {
    return this.usersService.createUser(dto);
  }
}
