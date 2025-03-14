import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ProductCategoryModule } from '../product-category/product-category.module';

@Module({
  providers: [ProductService, PrismaService, ProductCategoryModule],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule {}
