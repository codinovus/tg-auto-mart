import {
    Injectable,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/shared/prisma/prisma.service';
  import {
    CreateCryptoWalletDto,
    CryptoWalletResponseDto,
    GetAllCryptoWalletsResponseDto,
    UpdateCryptoWalletDto,
  } from './model/crypto-wallet.dto';
  
  @Injectable()
  export class CryptoWalletService {
    constructor(private prisma: PrismaService) {}
  
    async createCryptoWallet(
      createWalletDto: CreateCryptoWalletDto,
    ): Promise<CryptoWalletResponseDto> {
      const { type, address, userId } = createWalletDto;
  
      // Check if the address already exists
      const existingWallet = await this.prisma.cryptoWallet.findUnique({
        where: { address },
      });
  
      if (existingWallet) {
        throw new ConflictException('Wallet with this address already exists');
      }
  
      const wallet = await this.prisma.cryptoWallet.create({
        data: { type, address, userId },
      });
  
      return wallet;
    }
  
    async getAllCryptoWallets(
      page: number,
      limit: number,
    ): Promise<GetAllCryptoWalletsResponseDto> {
      const totalItems = await this.prisma.cryptoWallet.count();
  
      const wallets = await this.prisma.cryptoWallet.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });
  
      const walletResponseDtos: CryptoWalletResponseDto[] = wallets.map(
        (wallet) => ({
          id: wallet.id,
          type: wallet.type,
          address: wallet.address,
          userId: wallet.userId,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
        }),
      );
  
      const totalPages = Math.ceil(totalItems / limit);
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
      const wallet = await this.prisma.cryptoWallet.findUnique({
        where: { id: walletId },
      });
  
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }
  
      return wallet;
    }
  
    async updateCryptoWalletById(
      walletId: string,
      updateData: UpdateCryptoWalletDto,
    ): Promise<CryptoWalletResponseDto> {
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
  
      return updatedWallet;
    }
  
    async deleteCryptoWalletById(walletId: string): Promise<{
      success: boolean;
      message: string;
    }> {
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

    async getAllCryptoWalletsByUserIdentifier(
      identifier: string,
      page: number,
      limit: number,
    ): Promise<GetAllCryptoWalletsResponseDto> {
      let userId = identifier;
      if (identifier.startsWith('tg-')) {
        const user = await this.prisma.user.findUnique({
          where: { telegramId: identifier },
        });
    
        if (!user) {
          throw new NotFoundException(`User with Telegram ID ${identifier} not found`);
        }
    
        userId = user.id;
      }
    
      const totalItems = await this.prisma.cryptoWallet.count({
        where: { userId },
      });
    
      if (totalItems === 0) {
        throw new NotFoundException(`No wallets found for identifier ${identifier}`);
      }
    
      const wallets = await this.prisma.cryptoWallet.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
      });
    
      return {
        success: true,
        message: `Crypto wallets for identifier ${identifier} fetched successfully`,
        data: wallets,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          perPage: limit,
        },
      };
    }
     
  }
  