import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { VerifyProofDto } from './dto/verify-proof.dto';

@Injectable()
export class ZkService {
  constructor(private readonly prisma: PrismaService, private readonly blockchain: BlockchainService) {}

  async verifyProof(userId: string, dto: VerifyProofDto) {
    const isValid = await this.blockchain.verifyTrustProof(dto.minScore, dto.proof, dto.publicInputs);
    if (!isValid) {
      throw new BadRequestException('Invalid ZK proof');
    }
    return this.prisma.zkProof.create({
      data: {
        userId,
        minScore: dto.minScore,
        proof: dto.proof,
        publicInputs: dto.publicInputs,
        txHash: dto.txHash,
      },
    });
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
