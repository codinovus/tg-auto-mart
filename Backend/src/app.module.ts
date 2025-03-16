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

@Module({
  imports: [ConfigModule.forRoot(), ReferralModule, ProductKeyModule, ProductModule, UserModule, StoreModule, ProductCategoryModule, TelegramModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
