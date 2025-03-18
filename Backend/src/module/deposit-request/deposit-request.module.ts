import { Module } from '@nestjs/common';
import { DepositRequestService } from './deposit-request.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  providers: [DepositRequestService, PrismaService],
  exports: [DepositRequestService],
})
export class DepositRequestModule {}