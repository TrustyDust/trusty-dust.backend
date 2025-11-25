import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

describe('NotificationService', () => {
  const prisma = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
  const gateway = { emit: jest.fn() } as unknown as NotificationGateway;

  let service: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService(prisma, gateway);
  });

  it('notify stores notification and emits via gateway', async () => {
    (prisma.notification.create as jest.Mock).mockResolvedValue({
      id: 'notif',
    });
    const result = await service.notify('user', 'hello');
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: { userId: 'user', message: 'hello' },
    });
    expect(gateway.emit).toHaveBeenCalledWith('user', { id: 'notif' });
    expect(result).toEqual({ id: 'notif' });
  });

  it('list delegates to prisma findMany', async () => {
    (prisma.notification.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const notifications = await service.list('user');
    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user' },
      orderBy: { createdAt: 'desc' },
    });
    expect(notifications).toEqual([{ id: 1 }]);
  });

  it('markAsRead updates notification and sets readAt', async () => {
    const existing = { id: 'notif', userId: 'user', isRead: false };
    (prisma.notification.findFirst as jest.Mock).mockResolvedValue(existing);
    (prisma.notification.update as jest.Mock).mockResolvedValue({ ...existing, isRead: true });

    const result = await service.markAsRead('user', 'notif');
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif' },
      data: {
        isRead: true,
        readAt: expect.any(Date),
      },
    });
    expect(result.isRead).toBe(true);
  });
});
