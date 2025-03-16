import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}