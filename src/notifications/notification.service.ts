import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService, private readonly gateway: NotificationGateway) {}

  async notify(userId: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
    this.gateway.emit(userId, notification);
    return notification;
  }

  list(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
