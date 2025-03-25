import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { ProductKeyModule } from '../product-key/product-key.module';

@Module({
  imports: [PrismaModule, ProductKeyModule],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}