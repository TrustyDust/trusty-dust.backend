import { Injectable, Logger } from '@nestjs/common';
import initNoirWasm, { Noir } from '@noir-lang/noir_wasm';
import { BarretenbergWasm, StandardProver } from '@noir-lang/barretenberg';
import { ZkCompiler } from './zk.compiler';
import { ZkProofResult, ZkWitnessInput } from './zk.types';
import { bufferToHex } from './zk.utils';

@Injectable()
export class ZkProver {
  private readonly logger = new Logger(ZkProver.name);
  private noir?: Noir;
  private barretenberg?: BarretenbergWasm;
  private prover?: StandardProver;

  constructor(private readonly compiler: ZkCompiler) {}

  private async ensureInitialized() {
    if (!this.noir) {
      await initNoirWasm();
      this.noir = new Noir(await this.compiler.getAcir());
    }

    if (!this.barretenberg) {
      this.barretenberg = await BarretenbergWasm.new();
      await this.barretenberg.initSRS(1 << 18);
    }

    if (!this.prover) {
      this.prover = await StandardProver.new(
        this.barretenberg!,
        await this.compiler.getAcir(),
        await this.compiler.getProvingKey(),
      );
    }
  }

  async createWitness(input: ZkWitnessInput) {
    await this.ensureInitialized();
    return this.noir!.execute(input as any);
  }

  async generateProof(input: ZkWitnessInput): Promise<ZkProofResult> {
    await this.ensureInitialized();
    const execution = await this.createWitness(input);
    const proofBuffer = await this.prover!.prove(execution.witness);
    const publicInputs = Array.isArray(execution.returnValue)
      ? execution.returnValue.map((value: any) => value.toString())
      : [execution.returnValue?.toString?.() ?? '0'];

    return {
      proof: bufferToHex(proofBuffer),
      publicInputs,
    };
  }
}
