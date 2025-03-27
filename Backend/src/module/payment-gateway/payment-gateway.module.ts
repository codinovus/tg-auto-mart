import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [PaymentGatewayController],
  providers: [PaymentGatewayService, PrismaService],
  exports:[PaymentGatewayService]
})
export class PaymentGatewayModule {}
