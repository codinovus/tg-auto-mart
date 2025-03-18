import { Controller, Post, Body, Get, Query, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

import {
  GetAllUsersResponseDto,
  GetUserByIdResponseDto,
  RegisterUserModel,
  UpdateUserDto,
} from './model/user.model';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async register(@Body() body: RegisterUserModel) {
    return this.userService.registerUser(body);
  }

  @Get()
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<GetAllUsersResponseDto> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { users, pagination } = await this.userService.getUsers(
      pageNumber,
      limitNumber,
    );

    return new GetAllUsersResponseDto(
      true,
      'Users retrieved successfully',
      users,
      pagination,
    );
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<GetUserByIdResponseDto> {
    const user = await this.userService.getUserById(id);
    return new GetUserByIdResponseDto(
      true,
      'User  retrieved successfully',
      user,
    );
  }

  @Get(':userId/profile')
  async getUserProfile(@Param('userId') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<GetUserByIdResponseDto> {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') userId: string): Promise<{ success: boolean; message: string }> {
    return this.userService.deleteUser(userId);
  }  

  @Get('telegram/:telegramId')
  async getUserByTelegramId(@Param('telegramId') telegramId: string): Promise<GetUserByIdResponseDto> {
    const user = await this.userService.getUserByTelegramId(telegramId);
    return new GetUserByIdResponseDto(true, 'User  retrieved successfully', user);
  }
  
}
