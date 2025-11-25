import { Module, forwardRef } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TierService } from './tier.service';
import { TierController } from './tier.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SbtModule } from '../sbt/sbt.module';
import { NotificationModule } from '../notifications/notification.module';
import { ZkModule } from '../zk/zk.module';

@Module({
  imports: [PrismaModule, SbtModule, NotificationModule, forwardRef(() => ZkModule)],
  providers: [TierService, ThrottlerGuard],
  controllers: [TierController],
  exports: [TierService],
})
export class TierModule {}
