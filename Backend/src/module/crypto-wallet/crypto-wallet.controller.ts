import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CryptoWalletService } from './crypto-wallet.service';
import {
  CreateCryptoWalletDto,
  CryptoWalletResponseDto,
  GetAllCryptoWalletsResponseDto,
  UpdateCryptoWalletDto,
} from './model/crypto-wallet.dto';

@Controller('crypto-wallets')
export class CryptoWalletController {
  constructor(private readonly cryptoWalletService: CryptoWalletService) {}

  @Post()
  async createWallet(@Body() createCryptoWalletDto: CreateCryptoWalletDto) {
    const wallet = await this.cryptoWalletService.createCryptoWallet(
      createCryptoWalletDto,
    );
    return {
      success: true,
      message: 'Crypto wallet created successfully',
      data: wallet,
    };
  }

  @Get()
  async getAllWallets(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<GetAllCryptoWalletsResponseDto> {
    return this.cryptoWalletService.getAllCryptoWallets(page, limit);
  }

  @Get(':id')
  async getWalletById(
    @Param('id') walletId: string,
  ): Promise<CryptoWalletResponseDto> {
    return this.cryptoWalletService.getCryptoWalletById(walletId);
  }

  @Put(':id')
  async updateWallet(
    @Param('id') walletId: string,
    @Body() updateCryptoWalletDto: UpdateCryptoWalletDto,
  ): Promise<CryptoWalletResponseDto> {
    return this.cryptoWalletService.updateCryptoWalletById(
      walletId,
      updateCryptoWalletDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteWallet(@Param('id') walletId: string) {
    return this.cryptoWalletService.deleteCryptoWalletById(walletId);
  }

  @Get('by-identifier/:identifier')
  async getAllWalletsByUserIdentifier(
    @Param('identifier') identifier: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<GetAllCryptoWalletsResponseDto> {
    return this.cryptoWalletService.getAllCryptoWalletsByUserIdentifier(identifier, page, limit);
  }  
}
