import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UserService } from '../user/user.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ProductService } from '../product/product.service';
import { ReferralService } from '../referral/referral.service';
import { CryptoWalletService } from '../crypto-wallet/crypto-wallet.service';
import { WalletService } from '../wallet/wallet.service';
import { OrderService } from '../order/order.service';
import { ProductKeyService } from '../product-key/product-key.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    TelegramService,
    WalletService,
    CryptoWalletService,
    UserService,
    ProductCategoryService,
    ProductService,
    ReferralService,
    OrderService,
    ProductKeyService
  ],
})
export class TelegramModule {}
