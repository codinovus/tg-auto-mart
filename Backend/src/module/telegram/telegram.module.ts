import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UserService } from '../user/user.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ProductService } from '../product/product.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [TelegramService, UserService, ProductCategoryService, ProductService],
})
export class TelegramModule {}