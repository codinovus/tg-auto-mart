/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/module/user/user.service';
import { LoginDto, RegisterDto, AuthResponseDto, JwtPayload, RegisterUserModel } from 'src/module/user/model/user.model';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUsernameForAuth(username);
    
    if (!user) {
      return null;
    }
    
    if (!user.password) {
      return null;
    }
    
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      const { password: _password, ...result } = user;
      return result;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;
    
    try {
      const dbUser = await this.userService.findOneByUsername(username);
      
      if (!dbUser) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      const user = await this.validateUser(username, password);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      const payload: JwtPayload = {
        sub: user.id.toString(),
        username: user.username || '',
        role: user.role,
      };
      
      const token = this.jwtService.sign(payload);
      
      const response = new AuthResponseDto(true, 'Login successful', token, user);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    if (registerDto.username) {
      const existingUser = await this.userService.findOneByUsername(registerDto.username);
      if (existingUser) {
        throw new BadRequestException('Username already exists');
      }
    }
  
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const userModel: RegisterUserModel = {
      username: registerDto.username,
      password: hashedPassword,
      telegramId: registerDto.telegramId,
      role: registerDto.role ? registerDto.role as Role : undefined
    };
  
    const result = await this.userService.registerUser(userModel);
    
    const user = 'user' in result ? result.user : result;
  
    const payload: JwtPayload = {
      sub: user.id.toString(),
      username: user.username || '',
      role: user.role,
    };
  
    const token = this.jwtService.sign(payload);
    return new AuthResponseDto(true, 'Registration successful', token, user);
  }

  async loginWithTelegram(telegramId: string): Promise<AuthResponseDto> {
    try {
      const user = await this.userService.getUserByTelegramId(telegramId);
      
      const payload: JwtPayload = {
        sub: user.id.toString(),
        username: user.username || 'telegram_user',
        role: user.role,
      };

      const token = this.jwtService.sign(payload);
      return new AuthResponseDto(true, 'Login with Telegram successful', token, user);
    } catch (error) {
      if (error.status === 404) { const username = `telegram_${Date.now()}`;
        
        const result = await this.userService.registerUser ({
          username,
          telegramId,
        });
        
        const user = 'user' in result ? result.user : result;

        const payload: JwtPayload = {
          sub: user.id.toString(),
          username: user.username || 'telegram_user',
          role: user.role,
        };

        const token = this.jwtService.sign(payload);
        return new AuthResponseDto(true, 'User  registered and logged in via Telegram', token, user);
      }
      throw new UnauthorizedException('Unable to login with Telegram');
    }
  }

  async getUserProfile(userId: string) {
    return this.userService.getProfile(userId);
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}