import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService, private readonly gateway: NotificationGateway) {}

  async notify(userId: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
    this.gateway.emit(userId, notification);
    this.logger.log(`Notification sent to ${userId}: ${message}`);
    return notification;
  }

  list(userId: string) {
    this.logger.debug(`Fetching notifications for ${userId}`);
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
