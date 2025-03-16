import { Module } from '@nestjs/common';
import { CryptoWalletController } from './crypto-wallet.controller';
import { CryptoWalletService } from './crypto-wallet.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [CryptoWalletController],
  providers: [CryptoWalletService, PrismaService],
  exports: [CryptoWalletService],
})
export class CryptoWalletModule {}
