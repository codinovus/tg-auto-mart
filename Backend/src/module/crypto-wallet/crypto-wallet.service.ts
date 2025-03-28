/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  CreateCryptoWalletDto,
  CryptoWalletResponseDto,
  GetAllCryptoWalletsResponseDto,
  UpdateCryptoWalletDto,
} from './model/crypto-wallet.dto';
import { SearchableField, SearchBuilder } from 'src/shared/base/search-builder.util';
import { PrismaSchemaUtil } from 'src/shared/prisma/prisma-schema.util';

@Injectable()
export class CryptoWalletService {
  constructor(private prisma: PrismaService) {}

  // Helper Methods
  private validatePagination(page: number, limit: number): void {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
  }

  private mapToCryptoWalletResponse(wallet: any): CryptoWalletResponseDto {
    return {
      id: wallet.id,
      type: wallet.type,
      address: wallet.address,
      userId: wallet.userId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  // Create Methods
  async createCryptoWallet(
    createWalletDto: CreateCryptoWalletDto,
  ): Promise<CryptoWalletResponseDto> {
    const { type, address, userId } = createWalletDto;

    if (!type || !address || !userId) {
      throw new BadRequestException('Type, address, and userId are required');
    }

    const existingWallet = await this.prisma.cryptoWallet.findUnique({
      where: { address },
    });

    if (existingWallet) {
      throw new ConflictException('A wallet with this address already exists');
    }

    const wallet = await this.prisma.cryptoWallet.create({
      data: { type, address, userId },
    });

    return this.mapToCryptoWalletResponse(wallet);
  }

  // Get Methods
  async getAllCryptoWallets(
    page: number,
    limit: number,
    search?: string,
  ): Promise<GetAllCryptoWalletsResponseDto> {
    this.validatePagination(page, limit);
  
    // Define searchable fields
    const searchableFields: SearchableField[] = [
      { name: 'address', type: 'string' },
      { name: 'type', type: 'enum', enumType: 'CryptoType' },
      {
        name: 'user',
        nested: true,
        relationField: 'user',
        searchableFields: [
          { name: 'username', type: 'string' },
        ],
      },
    ];
  
    // Build the where clause based on the search query
    const whereClause = SearchBuilder.buildWhereClause(search, searchableFields);
  
    // Count total items matching the where clause
    const totalItems = await this.prisma.cryptoWallet.count({
      where: whereClause,
    });
  
    // Fetch wallets with pagination and include user relation
    const wallets = await this.prisma.cryptoWallet.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true, // Include user to access username
      },
    });
  
    // Map the wallets to response DTOs
    const walletResponseDtos: CryptoWalletResponseDto[] = wallets.map(
      (wallet) => this.mapToCryptoWalletResponse(wallet),
    );
  
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
  
    // Return the response DTO
    return {
      success: true,
      message: 'Crypto wallets fetched successfully',
      data: walletResponseDtos,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    };
  }

  async getCryptoWalletById(walletId: string): Promise<CryptoWalletResponseDto> {
    if (!walletId) {
      throw new BadRequestException('Wallet ID is required');
    }

    const wallet = await this.prisma.cryptoWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return this.mapToCryptoWalletResponse(wallet);
  }

  async getAllCryptoWalletsByUserIdentifier(
    userId: string,
    page: number,
    limit: number,
  ): Promise<GetAllCryptoWalletsResponseDto> {
    this.validatePagination(page, limit);

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const totalItems = await this.prisma.cryptoWallet.count({
      where: { userId },
    });

    if (totalItems === 0) {
      throw new NotFoundException(`No wallets found for user ID ${userId}`);
    }

    const wallets = await this.prisma.cryptoWallet.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
    });

    const walletResponseDtos: CryptoWalletResponseDto[] = wallets.map(
      (wallet) => this.mapToCryptoWalletResponse(wallet),
    );

    const totalPages = Math.ceil(totalItems / limit);
    return {
      success: true,
      message: `Crypto wallets for user ID ${userId} fetched successfully`,
      data: walletResponseDtos,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    };
  }

  // Update Methods
  async updateCryptoWalletById(
    walletId: string,
    updateData: UpdateCryptoWalletDto,
  ): Promise<CryptoWalletResponseDto> {
    if (!walletId) {
      throw new BadRequestException('Wallet ID is required');
    }

    const wallet = await this.prisma.cryptoWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const updatedWallet = await this.prisma.cryptoWallet.update({
      where: { id: walletId },
      data: updateData,
    });

    return this.mapToCryptoWalletResponse(updatedWallet);
  }

  // Delete Methods
  async deleteCryptoWalletById(walletId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!walletId) {
      throw new BadRequestException('Wallet ID is required');
    }

    const wallet = await this.prisma.cryptoWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    await this.prisma.cryptoWallet.delete({
      where: { id: walletId },
    });

    return {
      success: true,
      message: `Wallet with ID ${walletId} deleted successfully`,
    };
  }
}