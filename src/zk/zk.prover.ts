import { Injectable, Logger } from '@nestjs/common';
import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { ZkCompiler } from './zk.compiler';
import { ZkProofResult, ZkWitnessInput } from './zk.types';
import { bufferToHex } from './zk.utils';

@Injectable()
export class ZkProver {
  private readonly logger = new Logger(ZkProver.name);
  private noir?: Noir;
  private backend?: BarretenbergBackend;

  constructor(private readonly compiler: ZkCompiler) {}

  private async ensureInitialized() {
    if (!this.noir) {
      const circuit = await this.compiler.getCompiledCircuit();
      this.noir = new Noir(circuit as any);
    }

    if (!this.backend) {
      const circuit = await this.compiler.getCompiledCircuit();
      this.backend = new BarretenbergBackend(circuit as any);
    }
  }

  async createWitness(input: ZkWitnessInput) {
    await this.ensureInitialized();
    this.logger.debug(`Creating witness for score ${input.score} and minScore ${input.minScore}`);
    const witnessInput: Record<string, string> = {
      score: input.score,
      minScore: input.minScore,
    };
    return this.noir!.execute(witnessInput);
  }

  async generateProof(input: ZkWitnessInput): Promise<ZkProofResult> {
    await this.ensureInitialized();
    this.logger.log('Generating Noir proof via backend');
    const execution = await this.createWitness(input);
    const proofData = await this.backend!.generateProof(execution.witness);

    return {
      proof: bufferToHex(proofData.proof),
      publicInputs: proofData.publicInputs,
    };
  }
}
