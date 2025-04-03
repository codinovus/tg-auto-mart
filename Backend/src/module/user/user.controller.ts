import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Query, 
  Param, 
  Put, 
  Delete, 
  HttpCode, 
  HttpStatus, 
  DefaultValuePipe, 
  UseGuards 
} from '@nestjs/common';
import { UserService } from './user.service';
import { 
  GetAllUsersResponseDto, 
  GetUserByIdResponseDto, 
  RegisterUserModel, 
  UpdateUserDto 
} from './model/user.model';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async register(@Body() body: RegisterUserModel) {
      return this.userService.registerUser (body);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Only allow ADMIN to get all users
  async getAllUsers(
      @Query('page', new DefaultValuePipe('1')) page: string,
      @Query('limit', new DefaultValuePipe('10')) limit: string,
      @Query('search') search?: string,
  ): Promise<GetAllUsersResponseDto> {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
  
      const { users, pagination } = await this.userService.getUsers(
          pageNumber,
          limitNumber,
          search
      );
  
      return new GetAllUsersResponseDto(
          true,
          'Users retrieved successfully',
          users,
          pagination,
      );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Only allow ADMIN to get user by ID
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
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Only allow ADMIN to update user
  async updateUser (
      @Param('id') userId: string,
      @Body() updateUserDto: UpdateUserDto
  ): Promise<GetUserByIdResponseDto> {
      return this.userService.updateUser (userId, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Only allow ADMIN to delete user
  async deleteUser (@Param('id') userId: string): Promise<{ success: boolean; message: string }> {
      return this.userService.deleteUser (userId);
  }  

  @Get('telegram/:telegramId')
  async getUserByTelegramId(@Param('telegramId') telegramId: string): Promise<GetUserByIdResponseDto> {
      const user = await this.userService.getUserByTelegramId(telegramId);
      return new GetUserByIdResponseDto(true, 'User  retrieved successfully', user);
  }
}