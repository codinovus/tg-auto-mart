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
  } from '@nestjs/common';
  import { WalletService } from './wallet.service';
  import {
    CreateWalletDto,
    UpdateWalletDto,
  } from './model/wallet.model';
  
  @Controller('wallet')
  export class WalletController {
    constructor(private readonly walletService: WalletService) {}
  
    @Post()
    async createWallet(@Body() createWalletDto: CreateWalletDto) {
      return this.walletService.createWallet(createWalletDto);
    }
  
    @Put(':id')
    async updateWalletById(
      @Param('id') walletId: string,
      @Body() updateWalletDto: UpdateWalletDto,
    ) {
      return this.walletService.updateWalletById(walletId, updateWalletDto);
    }
  
    @Delete(':id')
    async deleteWallet(@Param('id') walletId: string) {
      return this.walletService.deleteWalletById(walletId);
    }
  
    @Get(':id')
    async getWalletById(@Param('id') walletId: string) {
      return this.walletService.getWalletById(walletId);
    }
  
    @Get()
    async getAllWallets(
      @Query('page', new DefaultValuePipe('1')) page: string,
      @Query('limit', new DefaultValuePipe('10')) limit: string,
      @Query('search') search?: string,
    ) {
      return this.walletService.getAllWallets(Number(page), Number(limit), search);
    }
  
    @Get('user/:userId')
    async getWalletByUserId(@Param('userId') userId: string) {
      return this.walletService.getWalletByUserId(userId);
    }
  
    @Get('telegram/:telegramId')
    async getWalletByTelegramId(@Param('telegramId') telegramId: string) {
      return this.walletService.getWalletByTelegramId(telegramId);
    }
  
    @Put('telegram/:telegramId')
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
  