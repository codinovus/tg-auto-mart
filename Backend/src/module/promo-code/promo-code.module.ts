import { Module } from '@nestjs/common';
import { PromoCodeController } from './promo-code.controller';
import { PromoCodeService } from './promo-code.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [PromoCodeController],
  providers: [PromoCodeService, PrismaService]
})
export class PromoCodeModule {}
