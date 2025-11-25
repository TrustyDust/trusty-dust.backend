import { Module } from '@nestjs/common';
import { NotificationService } from '@/notifications/notification.service';
import { NotificationGateway } from '@/notifications/notification.gateway';
import { NotificationController } from '@/notifications/notification.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService, NotificationGateway],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
