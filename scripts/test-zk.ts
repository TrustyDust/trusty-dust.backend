import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { AbiLoaderService } from '../src/blockchain/abi-loader.service';
import { BlockchainService } from '../src/blockchain/blockchain.service';
import { ZkCompiler } from '../src/zk/zk.compiler';
import { ZkProver } from '../src/zk/zk.prover';

async function main() {
  const compiler = new ZkCompiler();
  if (!compiler.hasBuildArtifacts()) {
    throw new Error('Compile the Noir circuit first: cd circuits/wallet_score && nargo check && nargo compile');
  }
  await compiler.loadArtifacts();

  const prover = new ZkProver(compiler);
  const witness = { score: '500', minScore: '300' };
  const proofResult = await prover.generateProof(witness);
  console.log('Generated proof:', proofResult);

  const config = new ConfigService();
  const blockchain = new BlockchainService(config, new AbiLoaderService());
  if (config.get('VERIFIER_CONTRACT') ?? config.get('TRUST_VERIFICATION_ADDRESS')) {
    try {
      const valid = await blockchain.verifyTrustProof({
        proof: proofResult.proof,
        publicInputs: proofResult.publicInputs,
      });
      console.log('On-chain verifier response:', valid);
    } catch (error) {
      console.warn('Verifier contract call failed (continuing anyway):', error);
    }
  } else {
    console.log('Skipping on-chain verifier call (VERIFIER_CONTRACT not configured)');
  }

  const prisma = new PrismaService();
  try {
    await prisma.zkProof.create({
      data: {
        userId: 'demo-user',
        minScore: 300,
        proof: proofResult.proof,
        publicInputs: proofResult.publicInputs,
      },
    });
    console.log('Proof persisted to database.');
  } catch (error) {
    console.warn('Skipping database persistence (likely missing demo user):', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
