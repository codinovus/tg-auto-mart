import { Module } from '@nestjs/common';
import { DepositRequestService } from './deposit-request.service';
import { DepositRequestController } from './deposit-request.controller';

@Module({
  providers: [DepositRequestService],
  controllers: [DepositRequestController]
})
export class DepositRequestModule {}
