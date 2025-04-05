/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RegisterUserModel } from 'src/module/user/model/user.model';
import { UserService } from 'src/module/user/user.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUsernameForAuth(username);
    
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return { id: user.id, username: user.username, role: user.role };
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const userProfile = await this.userService.getProfile(user.id);
    const decodedAccess = this.jwtService.decode(accessToken);
    const decodedRefresh = this.jwtService.decode(refreshToken);

    return {
      user: userProfile,
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpires: new Date(decodedAccess.exp * 1000).toISOString(),
        refreshTokenExpires: new Date(decodedRefresh.exp * 1000).toISOString(),
      },
      message: 'Login successful'
    };
  }

  async register(userRegistrationData: RegisterUserModel) {
    return this.userService.registerUser(userRegistrationData);
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
        console.error('refresh_token must be a string and should not be empty');
    }

    try {
        const payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_SECRET') || 'yourSecretKey',
        });

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });

        if (!user || user.refreshToken !== refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const newPayload = { username: user.username, sub: user.id };
        const newAccessToken = this.jwtService.sign(newPayload);
        const newRefreshToken = this.jwtService.sign(newPayload, {
            expiresIn: '7d',
        });

        // Update the user's refresh token in the database
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        // Return the new tokens
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error refreshing token:', error);
        throw new UnauthorizedException('Invalid refresh token');
    }
}

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logout successful' };
  }
}