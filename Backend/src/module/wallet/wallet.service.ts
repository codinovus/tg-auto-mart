import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateWalletDto, WalletResponseDto, UpdateWalletDto, GetAllWalletsResponseDto } from './model/wallet.model';
import { UserService } from '../user/user.service';
import { TransactionType, PaymentStatus } from '@prisma/client';

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
  async getAllWallets(
    page: number, 
    limit: number,
    search?: string
  ): Promise<GetAllWalletsResponseDto> {
    try {
      this.validatePagination(page, limit);
  
      let whereClause = {};
  
      if (search && search.trim() !== '') {
        const searchTerm = search.trim();
        const isNumber = !isNaN(parseFloat(searchTerm)) && isFinite(Number(searchTerm));
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
  
        whereClause = {
          OR: [
            // Basic wallet fields
            ...(isUuid ? [{ id: searchTerm }] : []),
            ...(isNumber ? [{ balance: parseFloat(searchTerm) }] : []),
  
            // Related user fields
            {
              user: {
                OR: [
                  { username: { contains: searchTerm, mode: 'insensitive' } },
                  { telegramId: { contains: searchTerm, mode: 'insensitive' } },
                  ...(isUuid ? [{ id: searchTerm }] : [])
                ]
              }
            },
  
            // Related transactions search
            {
              transactions: {
                some: {
                  OR: [
                    ...(isNumber ? [{ amount: parseFloat(searchTerm) }] : []),
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                    ...(Object.values(TransactionType).includes(searchTerm.toUpperCase() as TransactionType) ? 
                      [{ type: searchTerm.toUpperCase() as TransactionType }] : 
                      []
                    ),
                    ...(Object.values(PaymentStatus).includes(searchTerm.toUpperCase() as PaymentStatus) ? 
                      [{ status: searchTerm.toUpperCase() as PaymentStatus }] : 
                      []
                    )
                  ]
                }
              }
            }
          ]
        };
      }
  
      const totalItems = await this.prisma.wallet.count({
        where: whereClause
      });
  
      const wallets = await this.prisma.wallet.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
          transactions: {
            take: 5, // Limit the number of recent transactions
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      const walletResponseDtos: WalletResponseDto[] = wallets.map(wallet => 
        this.mapWalletToResponse(wallet)
      );
  
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
        }
      );
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw new InternalServerErrorException('An error occurred while fetching wallets');
    }
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