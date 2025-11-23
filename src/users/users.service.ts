import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrivyUserPayload } from '../auth/interfaces/privy-user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByWallet(walletAddress: string) {
    return this.prisma.user.findUnique({ where: { walletAddress: walletAddress.toLowerCase() } });
  }

  async upsertFromPrivy(privy: PrivyUserPayload) {
    return this.prisma.user.upsert({
      where: { walletAddress: privy.walletAddress.toLowerCase() },
      create: {
        walletAddress: privy.walletAddress.toLowerCase(),
        username: privy.email ?? privy.walletAddress.slice(0, 6),
        trustScore: 0,
        tier: 'Dust',
      },
      update: privy.email
        ? {
            username: privy.email,
          }
        : {},
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        avatar: dto.avatar,
      },
    });
    return updated;
  }

  async ensureExists(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
