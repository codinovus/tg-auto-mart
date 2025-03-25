import { Module } from '@nestjs/common';
import { DepositRequestService } from './deposit-request.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { DepositRequestController } from './deposit-request.controller';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';

@Module({
  controllers: [DepositRequestController],
  providers: [DepositRequestService, PrismaService, PaymentGatewayService],
  exports: [DepositRequestService]
})
export class DepositRequestModule {}