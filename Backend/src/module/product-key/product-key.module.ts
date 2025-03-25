import { Module } from '@nestjs/common';
import { ProductKeyService } from './product-key.service';
import { ProductKeyController } from './product-key.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [ProductKeyController],
  providers: [ProductKeyService, PrismaService],
  exports: [ProductKeyService], // Export the service
})
export class ProductKeyModule {}