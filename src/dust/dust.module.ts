import { Module } from '@nestjs/common';
import { DustService } from './dust.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  providers: [DustService],
  exports: [DustService],
})
export class DustModule {}
