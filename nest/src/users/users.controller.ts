import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { UserResponseDto } from './dto/user.response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원 생성
  @Post()
  async createUser(
    @Body() dto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.createUser(dto);
    return new UserResponseDto(user);
  }

  // 회원 단건 조회
  @Get(':id')
  async findUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findUser(id);
    return new UserResponseDto(user);
  }
}
