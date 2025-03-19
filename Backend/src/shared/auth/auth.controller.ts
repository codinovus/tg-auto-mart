/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserProfileDto,
} from 'src/module/user/model/user.model';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('telegram-login')
  async loginWithTelegram(
    @Body() { telegramId }: { telegramId: string },
  ): Promise<AuthResponseDto> {
    return this.authService.loginWithTelegram(telegramId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<UserProfileDto> {
    return this.authService.getUserProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req): { id: string; username: string; role: string } {
    const { id, username, role } = req.user;
    return { id, username, role };
  }
}
