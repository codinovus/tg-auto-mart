import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateWalletDto, WalletResponseDto, UpdateWalletDto, GetAllWalletsResponseDto } from './model/wallet.model';
import { UserService } from '../user/user.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

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

  // Create Methods
  async createWallet(createWalletDto: CreateWalletDto): Promise<WalletResponseDto> {
    const { userId } = createWalletDto;

    await this.validateUserExists(userId);

    const existingWallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (existingWallet) {
      throw new ConflictException('User  already owns a wallet');
    }

    const wallet = await this.prisma.wallet.create({
      data: { userId, balance: 0 },
    });

    return this.mapWalletToResponse(wallet);
  }

  // Get Methods
  async getAllWallets(page: number, limit: number): Promise<GetAllWalletsResponseDto> {
    this.validatePagination(page, limit);

    const totalItems = await this.prisma.wallet.count();

    const wallets = await this.prisma.wallet.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { user: true },
    });

    const walletResponseDtos: WalletResponseDto[] = wallets.map(wallet => this.mapWalletToResponse(wallet));

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

  async getWalletById(walletId: string): Promise<WalletResponseDto> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { user: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return this.mapWalletToResponse(wallet);
  }

  async getWalletByUserId(userId: string): Promise<WalletResponseDto> {
    await this.validateUserExists(userId);

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user with ID ${userId} not found`);
    }

    return this.mapWalletToResponse(wallet);
  }

  async getWalletByTelegramId(telegramId: string): Promise<WalletResponseDto> {
    const user = await this.userService.getUserByTelegramId(telegramId);
    return this.getWalletByUserId(String(user.id));
  }

  // Update Methods
  async updateWalletById(walletId: string, updateData: UpdateWalletDto): Promise<WalletResponseDto> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { user: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: updateData,
    });

    return this.mapWalletToResponse(updatedWallet);
  }

  async updateWalletByUserId(userId: string, updateData: UpdateWalletDto): Promise<WalletResponseDto> {
    await this.validateUserExists(userId);

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user with ID ${userId} not found`);
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: updateData,
    });

    return this.mapWalletToResponse(updatedWallet);
  }

  async updateWalletByTelegramId(telegramId: string, updateData: UpdateWalletDto): Promise<WalletResponseDto> {
    const user = await this.userService.getUserByTelegramId(telegramId);
    return this.updateWalletByUserId(String(user.id), updateData);
  }

  // Delete Methods
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
}