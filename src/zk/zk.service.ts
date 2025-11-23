import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ZkProver } from './zk.prover';
import { ZkProofResult } from './zk.types';

@Injectable()
export class ZkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
    private readonly zkProver: ZkProver,
  ) {}

  async generateProof(userId: string, minScore: number): Promise<ZkProofResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const witnessInput = {
      userScore: user.trustScore.toString(),
      minScore: minScore.toString(),
    };

    const proofResult = await this.zkProver.generateProof(witnessInput);

    await this.prisma.zkProof.create({
      data: {
        userId,
        minScore,
        proof: proofResult.proof,
        publicInputs: proofResult.publicInputs,
      },
    });

    return proofResult;
  }

  async verifyProof(proof: string, publicInputs: string[]) {
    const valid = await this.blockchain.verifyTrustProof({ proof, publicInputs });
    if (!valid) {
      throw new BadRequestException('Invalid ZK proof');
    }
    return { valid };
  }

  async assertProof(userId: string, minScore: number, proofId?: string) {
    const proof = proofId
      ? await this.prisma.zkProof.findUnique({ where: { id: proofId } })
      : await this.prisma.zkProof.findFirst({
          where: { userId, minScore: { gte: minScore } },
          orderBy: { createdAt: 'desc' },
        });
    if (!proof || proof.userId !== userId || proof.minScore < minScore) {
      throw new BadRequestException('ZK proof missing or insufficient');
    }
    return proof;
  }

  queueProofRequest(userId: string, minScore: number) {
    return this.prisma.trustSnapshot.create({
      data: {
        userId,
        score: minScore,
        metadata: 'proof_requested',
      },
    });
  }
}
