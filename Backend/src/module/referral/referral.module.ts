import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [ReferralController],
  providers: [ReferralService, PrismaService],
  exports:[ReferralService]
})
export class ReferralModule {}
