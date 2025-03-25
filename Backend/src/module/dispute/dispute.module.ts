import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { DisputeController } from './dispute.controller';

@Module({
  controllers:[DisputeController],
  providers: [DisputeService, PrismaService],
  exports: [DisputeService],
})
export class DisputeModule {}