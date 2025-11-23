import { Module } from '@nestjs/common';
import { ZkService } from './zk.service';
import { ZkController } from './zk.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  providers: [ZkService],
  controllers: [ZkController],
  exports: [ZkService],
})
export class ZkModule {}
