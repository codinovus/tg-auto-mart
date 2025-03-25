import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { StoreModule } from './module/store/store.module';
import { ProductCategoryModule } from './module/product-category/product-category.module';
import { TelegramModule } from './module/telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './module/product/product.module';
import { ProductKeyModule } from './module/product-key/product-key.module';
import { ReferralModule } from './module/referral/referral.module';
import { CryptoWalletModule } from './module/crypto-wallet/crypto-wallet.module';
import { WalletModule } from './module/wallet/wallet.module';
import { OrderModule } from './module/order/order.module';
import { DepositRequestModule } from './module/deposit-request/deposit-request.module';
import { DisputeModule } from './module/dispute/dispute.module';
import { PaymentModule } from './module/payment/payment.module';
import { PromoCodeModule } from './module/promo-code/promo-code.module';
import { TransactionModule } from './module/transaction/transaction.module';
import { AuthModule } from './shared/auth/auth.module';
import { PaymentGatewayModule } from './module/payment-gateway/payment-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    OrderModule,
    CryptoWalletModule,
    WalletModule,
    ReferralModule,
    ProductKeyModule,
    ProductModule,
    UserModule,
    StoreModule,
    ProductCategoryModule,
    TelegramModule,
    PrismaModule,
    DepositRequestModule,
    DisputeModule,
    PaymentModule,
    PromoCodeModule,
    ReferralModule,
    TransactionModule,
    WalletModule,
    AuthModule,
    ConfigModule,
    PaymentGatewayModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
