import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from 'src/shared/prisma/prisma.service';

import { PaginationMeta } from 'src/shared/model/GenericResponse.dto';
import {
  GetUserByIdResponseDto,
  RegisterUserModel,
  UpdateUserDto,
  UserProfileDto,
  UserResponseDto,
} from './model/user.model';

@Injectable()
export class UserService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(private prisma: PrismaService) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN as string;

    if (!botToken) {
      throw new Error(
        'TELEGRAM_BOT_TOKEN is not defined in environment variables',
      );
    }
    this.bot = new TelegramBot(botToken, { polling: true });
  }

  onModuleInit() {
    this.listenToTelegram();
  }

  private listenToTelegram() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id.toString();
      const username = msg.chat.username || `tg_user_${chatId}`;
      let user = await this.prisma.user.findUnique({
        where: { telegramId: chatId },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            username,
            telegramId: chatId,
            role: 'CUSTOMER',
          },
        });
        this.bot.sendMessage(
          chatId,
          `✅ Registered successfully! Welcome, ${username}`,
        );
      } else {
        this.bot.sendMessage(chatId, `👋 Welcome back, ${user.username}`);
      }
    });
  }

  async registerUser(userData: RegisterUserModel) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          password: userData.password,
          telegramId: userData.telegramId,
          role: userData.role || 'CUSTOMER',
        },
      });

      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });

      return { user, wallet };
    });
  }

  async getUsers(page: number, limit: number, searchQuery?: string) {
    const totalItems = await this.prisma.user.count({
      where: {
        OR: [
          { username: { contains: searchQuery, mode: 'insensitive' } },
          { telegramId: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchQuery, mode: 'insensitive' } },
          { telegramId: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        wallet: true,
        orders: true,
      },
    });

    const userResponseDtos: UserResponseDto[] = users.map((user) => ({
      id: user.id,
      username: user.username || undefined,
      telegramId: user.telegramId || undefined,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      balance: user.wallet ? user.wallet.balance : 0,
      orderCount: user.orders.length,
    }));

    const totalPages = Math.ceil(totalItems / limit);
    const pagination: PaginationMeta = {
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit,
    };

    return { users: userResponseDtos, pagination };
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        orders: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: user.id,
      username: user.username || undefined,
      telegramId: user.telegramId || undefined,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      balance: user.wallet ? user.wallet.balance : 0,
      orderCount: user.orders.length,
    };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        store: true,
        orders: true,
        disputes: true,
        cryptoWallets: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username ?? 'Guest',
      telegramId: user.telegramId ?? undefined,
      role: String(user.role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      wallet: user.wallet
        ? {
            id: user.wallet.id,
            balance: user.wallet.balance,
            createdAt: user.wallet.createdAt,
          }
        : undefined,
      orderCount: user.orders.length,
      disputeCount: user.disputes.length,
      cryptoWallets: user.cryptoWallets?.map((wallet) => ({
        id: wallet.id,
        address: wallet.address,
        type: wallet.type,
        createdAt: wallet.createdAt,
      })),
    };
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserDto,
  ): Promise<GetUserByIdResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true, orders: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: updateData.username ?? existingUser.username,
        password: updateData.password ?? existingUser.password,
        telegramId: updateData.telegramId ?? existingUser.telegramId,
        role: updateData.role ?? existingUser.role,
      },
      include: { wallet: true, orders: true },
    });

    const userResponse: UserResponseDto = {
      id: updatedUser.id,
      username: updatedUser.username || undefined,
      telegramId: updatedUser.telegramId || undefined,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      balance: updatedUser.wallet ? updatedUser.wallet.balance : 0,
      orderCount: updatedUser.orders.length,
    };

    return new GetUserByIdResponseDto(
      true,
      'User updated successfully',
      userResponse,
    );
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  
    await this.prisma.user.delete({ where: { id: userId } });
  
    return { success: true, message: `User with ID ${userId} has been deleted successfully` };
  }  
}
