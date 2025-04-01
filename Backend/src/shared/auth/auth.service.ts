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

    // Update user with refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Get complete user profile
    const userProfile = await this.userService.getProfile(user.id);

    // Get token expiration times
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
    try {
      // Verify the token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'yourSecretKey',
      });
      
      // Find the user by ID
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

      // Update user with new refresh token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
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
