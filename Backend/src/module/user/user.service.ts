import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { PaginationMeta } from 'src/shared/model/GenericResponse.dto';
import {
  GetUserByIdResponseDto,
  RegisterUserModel,
  UpdateUserDto,
  UserProfileDto,
  UserResponseDto,
} from './model/user.model';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User  with ID ${userId} not found`);
    }
  }

  private mapToUserResponseDto(user: any): UserResponseDto {
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

  // Create Methods
  async registerUser(userRegistrationData: RegisterUserModel) {
    if (userRegistrationData.telegramId) {
      const existingUser = await this.prisma.user.findUnique({
        where: { telegramId: userRegistrationData.telegramId },
      });

      if (existingUser) {
        if (!existingUser.password && userRegistrationData.password) {
          const hashedPassword = await bcrypt.hash(
            userRegistrationData.password,
            10,
          );
          const updatedUser = await this.prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
          });
          return updatedUser;
        }

        return existingUser;
      }
    }
    if (userRegistrationData.username) {
      const existingUserByUsername = await this.prisma.user.findUnique({
        where: { username: userRegistrationData.username },
      });

      if (existingUserByUsername) {
        throw new BadRequestException('Username already exists');
      }
    }
    return this.prisma.$transaction(async (prisma) => {
      let hashedPassword: string | null = null;
      if (userRegistrationData.password) {
        hashedPassword = await bcrypt.hash(userRegistrationData.password, 10);
      }
      const user = await prisma.user.create({
        data: {
          username: userRegistrationData.username,
          password: hashedPassword,
          telegramId: userRegistrationData.telegramId,
          role: userRegistrationData.role || 'CUSTOMER',
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

  // Get Methods
  async getUsers(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ users: UserResponseDto[]; pagination: PaginationMeta }> {
    this.validatePagination(page, limit);

    let whereClause = {};

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      const isNumber =
        !isNaN(parseFloat(searchTerm)) && isFinite(Number(searchTerm));
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          searchTerm,
        );

      whereClause = {
        OR: [
          // Basic fields
          ...(isUuid ? [{ id: searchTerm }] : []),
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { telegramId: { contains: searchTerm, mode: 'insensitive' } },

          // Wallet relation
          ...(isNumber
            ? [
                {
                  wallet: {
                    balance: parseFloat(searchTerm),
                  },
                },
              ]
            : []),

          // Orders relation
          ...(isNumber
            ? [
                {
                  orders: {
                    some: {
                      total: parseFloat(searchTerm),
                    },
                  },
                },
              ]
            : []),

          // Role enum
          ...(Object.values(Role).includes(searchTerm.toUpperCase() as Role)
            ? [{ role: searchTerm.toUpperCase() as Role }]
            : []),
        ],
      };
    }

    const totalItems = await this.prisma.user.count({
      where: whereClause,
    });

    const users = await this.prisma.user.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        wallet: true,
        orders: {
          include: {
            product: true,
            payment: true,
          },
        },
        cryptoWallets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const userResponseDtos: UserResponseDto[] = users.map((user) =>
      this.mapToUserResponseDto(user),
    );

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
    await this.validateUserExists(id);

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        orders: true,
      },
    });

    return this.mapToUserResponseDto(user);
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    await this.validateUserExists(userId);

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
      throw new NotFoundException(`User  with ID ${userId} not found`);
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
            updatedAt: user.wallet.updatedAt,
            userId: user.wallet.userId,
          }
        : undefined,
      orderCount: user.orders.length ?? 0,
      disputeCount: user.disputes.length ?? 0,
      cryptoWallets: user.cryptoWallets?.map((wallet) => ({
        id: wallet.id,
        address: wallet.address,
        type: wallet.type,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        userId: wallet.userId,
      })),
    };
  }

  // Update Methods
  async updateUser(
    userId: string,
    updateData: UpdateUserDto,
  ): Promise<GetUserByIdResponseDto> {
    await this.validateUserExists(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: updateData.username ?? undefined,
        password: updateData.password ?? undefined,
        telegramId: updateData.telegramId ?? undefined,
        role: updateData.role ?? undefined,
      },
      include: { wallet: true, orders: true },
    });

    const userResponse: UserResponseDto =
      this.mapToUserResponseDto(updatedUser);

    return new GetUserByIdResponseDto(
      true,
      'User  updated successfully',
      userResponse,
    );
  }

  // Delete Methods
  async deleteUser(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.validateUserExists(userId);

    await this.prisma.user.delete({ where: { id: userId } });

    return {
      success: true,
      message: `User  with ID ${userId} has been deleted successfully`,
    };
  }

  async getUserByTelegramId(telegramId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        wallet: true,
        orders: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `User  with Telegram ID ${telegramId} not found`,
      );
    }

    return this.mapToUserResponseDto(user);
  }

  async findOneByUsername(username: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        wallet: true,
        orders: true,
      },
    });

    if (!user) {
      return null;
    }
    return user;
  }

  async findOneByUsernameForAuth(username: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        telegramId: true,
      },
    });

    if (!user) {
      return null;
    }
    return user;
  }
}

