import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { TaskResponseDto } from './dto/task.response.dto';
import { ChangeTaskStatusRequestDto } from './dto/change-task-status.request.dto';
import { FindTasksQueryDto } from './dto/find-tasks.query.dto';
import { TaskListItemResponseDto } from './dto/task-list-item.response.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findTasks(
    @Query() query: FindTasksQueryDto,
  ): Promise<TaskListItemResponseDto[]> {
    const tasks = await this.tasksService.findTasks(query);
    return tasks.map((task) => new TaskListItemResponseDto(task));
  }

  @Post()
  async createTask(
    @Body() dto: CreateTaskRequestDto,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.createTask(dto);
    return new TaskResponseDto(task);
  }

  @Patch('/:taskId/status')
  async changeTaskStatus(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: ChangeTaskStatusRequestDto,
  ): Promise<TaskResponseDto> {
    const updatedTask = await this.tasksService.changeTaskStatus(taskId, dto);
    return new TaskResponseDto(updatedTask);
  }
}
