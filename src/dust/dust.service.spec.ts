import { BadRequestException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { DustService } from './dust.service';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

const DUST_UNIT = 10n ** 18n;

describe('DustService', () => {
  const prisma = {
    token: {
      upsert: jest.fn(),
    },
    userTokenBalance: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  const blockchain = {
    getDustBalance: jest.fn(),
    burnDust: jest.fn(),
  } as unknown as BlockchainService;

  let service: DustService;

  const mockBalance = {
    id: 'balance-1',
    balance: 10,
    dailyEarned: 5,
    dailyEarnedCheckpoint: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.token.upsert as jest.Mock).mockResolvedValue({ id: 'token-1' });
    (prisma.userTokenBalance.upsert as jest.Mock).mockResolvedValue(mockBalance);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ walletAddress: '0xabc' });
    (blockchain.getDustBalance as jest.Mock).mockResolvedValue(20n * DUST_UNIT);
    (blockchain.burnDust as jest.Mock).mockResolvedValue('0xtx');
    service = new DustService(prisma, blockchain);
  });

  describe('rewardUser', () => {
    it('caps rewards when exceeding daily limit', async () => {
      const updateReturn = { id: 'balance-1', balance: 12 };
      (prisma.userTokenBalance.update as jest.Mock).mockResolvedValue(updateReturn);

      const result = await service.rewardUser('user', 100, 'testing');

      expect(result).toEqual({ credited: 45, balance: 12 });
      expect(prisma.userTokenBalance.update).toHaveBeenCalled();
    });

    it('skips update when cap reached', async () => {
      const balance = {
        ...mockBalance,
        dailyEarned: 50,
        dailyEarnedCheckpoint: new Date(),
      };
      (prisma.userTokenBalance.upsert as jest.Mock).mockResolvedValue(balance);

      const result = await service.rewardUser('user', 5, 'testing');

      expect(result).toEqual({ credited: 0, balance: 10 });
      expect(prisma.userTokenBalance.update).not.toHaveBeenCalled();
    });
  });

  describe('spendDust', () => {
    it('throws when insufficient on-chain balance', async () => {
      (blockchain.getDustBalance as jest.Mock).mockResolvedValue(5n * DUST_UNIT);
      await expect(service.spendDust('user', 6, 'spend')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('burns tokens when balance sufficient', async () => {
      const result = await service.spendDust('user', 6, 'memo');
      expect(blockchain.getDustBalance).toHaveBeenCalledWith('0xabc');
      expect(blockchain.burnDust).toHaveBeenCalledWith('0xabc', 6);
      expect(result).toEqual({ burned: 6, txHash: '0xtx' });
    });

    it('throws when wallet missing', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.spendDust('user', 5, 'memo')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  it('getBalance returns ensureUserBalance result', async () => {
    const balance = await service.getBalance('user');
    expect(balance).toBe(10);
  });

  it('getMultiplier returns 1', async () => {
    expect(await service.getMultiplier('user')).toBe(1);
  });
});
