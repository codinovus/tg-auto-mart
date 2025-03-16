import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateWalletDto, WalletResponseDto, UpdateWalletDto, GetAllWalletsResponseDto } from './model/wallet.model';
import { UserService } from '../user/user.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService,
    private userservice: UserService
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<WalletResponseDto> {
    const { userId } = createWalletDto;
    const existingWallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (existingWallet) {
      throw new ConflictException('Wallet for this user already exists');
    }

    const wallet = await this.prisma.wallet.create({
      data: { userId, balance: 0 },
    });

    return {
      id: wallet.id,
      balance: wallet.balance,
      userId: wallet.userId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      username: null,
      telegramId: null,
    };
  }

  async updateWalletById(walletId: string, updateData: UpdateWalletDto): Promise<WalletResponseDto> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        user: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: updateData,
    });

    return {
      id: updatedWallet.id,
      balance: updatedWallet.balance,
      userId: updatedWallet.userId,
      createdAt: updatedWallet.createdAt,
      updatedAt: updatedWallet.updatedAt,
      username: wallet.user?.username || null,
      telegramId: wallet.user?.telegramId || null,
    };
  }

  async deleteWalletById(walletId: string): Promise<{ success: boolean; message: string }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    await this.prisma.wallet.delete({
      where: { id: walletId },
    });

    return {
      success: true,
      message: `Wallet with ID ${walletId} deleted successfully`,
    };
  }

  async getWalletById(walletId: string): Promise<WalletResponseDto> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        user: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return {
      id: wallet.id,
      balance: wallet.balance,
      userId: wallet.userId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      username: wallet.user?.username || null,
      telegramId: wallet.user?.telegramId || null,
    };
  }

  async getAllWallets(page: number, limit: number): Promise<GetAllWalletsResponseDto> {
    const totalItems = await this.prisma.wallet.count();

    const wallets = await this.prisma.wallet.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
      },
    });

    const walletResponseDtos: WalletResponseDto[] = wallets.map(wallet => ({
      id: wallet.id,
      balance: wallet.balance,
      userId: wallet.userId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      username: wallet.user?.username || null,
      telegramId: wallet.user?.telegramId || null,
    }));

    const totalPages = Math.ceil(totalItems / limit);
    return new GetAllWalletsResponseDto(
      true,
      'Wallets fetched successfully',
      walletResponseDtos,
      {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    );
  }

  async getWalletByTelegramId(telegramId: string): Promise<WalletResponseDto> {
    const user = await this.userservice.getUserByTelegramId(telegramId);
    return this.getWalletByUserId(String(user.id));
  }

  async getWalletByUserId(userId: string): Promise<WalletResponseDto> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user with ID ${userId} not found`);
    }

    return this.mapWalletToResponse(wallet);
  }

  private mapWalletToResponse(wallet: any): WalletResponseDto {
    return {
      id: wallet.id,
      balance: wallet.balance,
      userId: wallet.userId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      username: wallet.user?.username || null,
      telegramId: wallet.user?.telegramId || null,
    };
  }
  async updateWalletByTelegramId(telegramId: string, updateData: UpdateWalletDto): Promise<WalletResponseDto> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: telegramId },
      include: {
        user: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user with Telegram ID ${telegramId} not found`);
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: updateData,
    });

    return {
      id: updatedWallet.id,
      balance: updatedWallet.balance,
      userId: updatedWallet.userId,
      createdAt: updatedWallet.createdAt,
      updatedAt: updatedWallet.updatedAt,
      username: wallet.user?.username || null,
      telegramId: wallet.user?.telegramId || null,
    };
  }
}