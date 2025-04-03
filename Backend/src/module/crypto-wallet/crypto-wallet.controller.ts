import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CryptoWalletService } from './crypto-wallet.service';
import {
  CreateCryptoWalletDto,
  CryptoWalletResponseDto,
  GetAllCryptoWalletsResponseDto,
  UpdateCryptoWalletDto,
} from './model/crypto-wallet.dto';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('crypto-wallets')
@UseGuards(JwtAuthGuard)
export class CryptoWalletController {
  constructor(private readonly cryptoWalletService: CryptoWalletService) {}

  @Post()
  async createWallet(
    @Body() createCryptoWalletDto: CreateCryptoWalletDto,
    @Request() req,
  ) {
    // Assign the wallet to the authenticated user
    createCryptoWalletDto.userId = req.user.id;

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
  @UseGuards(RolesGuard)
  @Roles('STORE_ADMIN', 'DEVELOPER')
  async getAllWallets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GetAllCryptoWalletsResponseDto> {
    return this.cryptoWalletService.getAllCryptoWallets(page, limit, search);
  }

  @Get(':id')
  async getWalletById(
    @Param('id') walletId: string,
    @Request() req,
  ): Promise<CryptoWalletResponseDto> {
    const wallet = await this.cryptoWalletService.getCryptoWalletById(walletId);

    // Check if the wallet belongs to the current user or if the user is an admin
    if (wallet.userId !== req.user.id && req.user.role !== 'STORE_ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to access this wallet',
      );
    }

    return wallet;
  }

  @Put(':id')
  async updateWallet(
    @Param('id') walletId: string,
    @Body() updateCryptoWalletDto: UpdateCryptoWalletDto,
    @Request() req,
  ): Promise<CryptoWalletResponseDto> {
    const wallet = await this.cryptoWalletService.getCryptoWalletById(walletId);

    // Ensure the user is the owner or has the appropriate role
    if (wallet.userId !== req.user.id && req.user.role !== 'STORE_ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to update this wallet',
      );
    }

    return this.cryptoWalletService.updateCryptoWalletById(
      walletId,
      updateCryptoWalletDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteWallet(@Param('id') walletId: string, @Request() req) {
    const wallet = await this.cryptoWalletService.getCryptoWalletById(walletId);

    // Check ownership or admin role before deletion
    if (wallet.userId !== req.user.id && req.user.role !== 'STORE_ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this wallet',
      );
    }

    return this.cryptoWalletService.deleteCryptoWalletById(walletId);
  }

  @Get('by-identifier/:identifier')
  async getAllWalletsByUserIdentifier(
    @Param('identifier') identifier: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<GetAllCryptoWalletsResponseDto> {
    // Optionally, you can add role checks here if needed
    return this.cryptoWalletService.getAllCryptoWalletsByUserIdentifier(
      identifier,
      page,
      limit,
    );
  }
}
