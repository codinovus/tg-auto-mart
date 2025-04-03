import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Put,
  Delete,
  DefaultValuePipe,
  UseGuards
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  CreateWalletDto,
  UpdateWalletDto,
} from './model/wallet.model';
import { JwtAuthGuard } from 'src/shared/auth/jwt-auth.guard';
import { RolesGuard } from 'src/shared/auth/roles.guard';
import { Roles } from 'src/shared/auth/roles.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN') // Allow USER and ADMIN to create wallets
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
      return this.walletService.createWallet(createWalletDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN') // Allow USER and ADMIN to update wallets
  async updateWalletById(
      @Param('id') walletId: string,
      @Body() updateWalletDto: UpdateWalletDto,
  ) {
      return this.walletService.updateWalletById(walletId, updateWalletDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Only allow ADMIN to delete wallets
  async deleteWallet(@Param('id') walletId: string) {
      return this.walletService.deleteWalletById(walletId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN') // Allow USER and ADMIN to get wallet by ID
  async getWalletById(@Param('id') walletId: string) {
      return this.walletService.getWalletById(walletId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // Only allow ADMIN to get all wallets
  async getAllWallets(
      @Query('page', new DefaultValuePipe('1')) page: string,
      @Query('limit', new DefaultValuePipe('10')) limit: string,
      @Query('search') search?: string,
  ) {
      return this.walletService.getAllWallets(Number(page), Number(limit), search);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN') // Allow USER and ADMIN to get wallet by user ID
  async getWalletByUserId(@Param('userId') userId: string) {
      return this.walletService.getWalletByUserId(userId);
  }

  @Get('telegram/:telegramId')
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN') // Allow USER and ADMIN to get wallet by Telegram ID
  async getWalletByTelegramId(@Param('telegramId') telegramId: string) {
      return this.walletService.getWalletByTelegramId(telegramId);
  }

  @Put('telegram/:telegramId')
  @UseGuards(RolesGuard)
  @Roles('USER', 'ADMIN') // Allow USER and ADMIN to update wallet by Telegram ID
  async updateWalletByTelegramId(
      @Param('telegramId') telegramId: string,
      @Body() updateWalletDto: UpdateWalletDto,
  ) {
      return this.walletService.updateWalletByTelegramId(
          telegramId,
          updateWalletDto,
      );
  }
}