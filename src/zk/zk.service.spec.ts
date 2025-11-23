import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ZkService } from './zk.service';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ZkProver } from './zk.prover';

describe('ZkService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    zkProof: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    trustSnapshot: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  const blockchain = { verifyTrustProof: jest.fn() } as unknown as BlockchainService;
  const prover = { generateProof: jest.fn() } as unknown as ZkProver;

  let service: ZkService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ZkService(prisma, blockchain, prover);
  });

  describe('generateProof', () => {
    it('throws when user missing', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.generateProof('user', 100)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('stores proof after generation', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user', trustScore: 350 });
      (prover.generateProof as jest.Mock).mockResolvedValue({ proof: '0xproof', publicInputs: ['1'] });
      await service.generateProof('user', 300);
      expect(prover.generateProof).toHaveBeenCalledWith({ userScore: '350', minScore: '300' });
      expect(prisma.zkProof.create).toHaveBeenCalledWith({
        data: {
          userId: 'user',
          minScore: 300,
          proof: '0xproof',
          publicInputs: ['1'],
        },
      });
    });
  });

  describe('verifyProof', () => {
    it('throws when blockchain verification fails', async () => {
      (blockchain.verifyTrustProof as jest.Mock).mockResolvedValue(false);
      await expect(service.verifyProof('0xdead', [])).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns valid flag when proof passes', async () => {
      (blockchain.verifyTrustProof as jest.Mock).mockResolvedValue(true);
      const result = await service.verifyProof('0xproof', ['1']);
      expect(blockchain.verifyTrustProof).toHaveBeenCalledWith({ proof: '0xproof', publicInputs: ['1'] });
      expect(result).toEqual({ valid: true });
    });
  });

  describe('assertProof', () => {
    it('looks up by proofId when provided', async () => {
      (prisma.zkProof.findUnique as jest.Mock).mockResolvedValue({ id: 'proof', userId: 'user', minScore: 500 });
      const proof = await service.assertProof('user', 400, 'proof');
      expect(prisma.zkProof.findUnique).toHaveBeenCalledWith({ where: { id: 'proof' } });
      expect(proof).toEqual({ id: 'proof', userId: 'user', minScore: 500 });
    });

    it('searches by recency when proofId missing', async () => {
      (prisma.zkProof.findFirst as jest.Mock).mockResolvedValue({ userId: 'user', minScore: 700 });
      await service.assertProof('user', 600);
      expect(prisma.zkProof.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user', minScore: { gte: 600 } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('throws when proof missing or insufficient', async () => {
      (prisma.zkProof.findUnique as jest.Mock).mockResolvedValue({ id: 'proof', userId: 'other', minScore: 100 });
      await expect(service.assertProof('user', 200, 'proof')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it('queueProofRequest stores snapshot marker', async () => {
    (prisma.trustSnapshot.create as jest.Mock).mockResolvedValue({ id: 'snapshot' });
    const result = await service.queueProofRequest('user', 700);
    expect(prisma.trustSnapshot.create).toHaveBeenCalledWith({
      data: { userId: 'user', score: 700, metadata: 'proof_requested' },
    });
    expect(result).toEqual({ id: 'snapshot' });
  });
});
