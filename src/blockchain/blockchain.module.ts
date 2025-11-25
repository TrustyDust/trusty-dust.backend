import { Global, Module } from '@nestjs/common';
import { BlockchainService } from '@/blockchain/blockchain.service';
import { AbiLoaderService } from '@/blockchain/abi-loader.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [BlockchainService, AbiLoaderService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
