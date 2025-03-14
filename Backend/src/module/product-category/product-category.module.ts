import { Module } from '@nestjs/common';
import { ProductCategoryController } from './product-category.controller';
import { ProductCategoryService } from './product-category.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService, PrismaService],
  exports: [ProductCategoryService]
})
export class ProductCategoryModule {}
