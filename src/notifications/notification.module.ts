import { Module } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService, NotificationGateway, ThrottlerGuard],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
