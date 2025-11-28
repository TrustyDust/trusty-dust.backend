import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Abi } from '@noir-lang/types';
import {
  CIRCUIT_BUILD,
  CIRCUIT_FILES,
  CIRCUIT_TARGET,
  readAcirBuffer,
} from './zk.utils';

interface CircuitManifest {
  name: string;
  backend: string;
  commit_hash?: string;
}

@Injectable()
export class ZkCompiler implements OnModuleInit {
  private readonly logger = new Logger(ZkCompiler.name);
  private acir?: Uint8Array;
  private circuitManifest?: CircuitManifest;
  private provingKey?: Uint8Array;
  private verificationKey?: Uint8Array;
  private compiledCircuit?: NoirCompiledCircuit;

  async onModuleInit() {
    try {
      await this.loadArtifacts();
    } catch (error) {
      this.logger.warn(`Unable to eagerly load circuit artifacts: ${error}`);
    }
  }

  async loadArtifacts() {
    const acirUncompressed = readAcirBuffer();
    this.acir = acirUncompressed;
    this.circuitManifest = this.readManifest();
    this.provingKey = this.readOptionalBinary(CIRCUIT_FILES.provingKey);
    this.verificationKey = this.readOptionalBinary(
      CIRCUIT_FILES.verificationKey,
    );
    this.compiledCircuit = this.buildCompiledCircuit(acirUncompressed);
    this.logger.log(
      `Circuit ${this.circuitManifest?.name ?? 'unknown'} loaded with backend ${this.circuitManifest?.backend ?? 'n/a'}`,
    );
  }

  async getAcir() {
    if (!this.acir) {
      await this.loadArtifacts();
    }
    return this.acir!;
  }

  async getProvingKey() {
    if (!this.provingKey) {
      await this.loadArtifacts();
    }
    if (!this.provingKey) {
      throw new Error('Proving key not found. Generate it via nargo if needed.');
    }
    return this.provingKey;
  }

  async getVerificationKey() {
    if (!this.verificationKey) {
      await this.loadArtifacts();
    }
    if (!this.verificationKey) {
      throw new Error(
        'Verification key not found. Generate it via nargo if needed.',
      );
    }
    return this.verificationKey;
  }

  hasBuildArtifacts() {
    return (
      existsSync(join(CIRCUIT_BUILD, CIRCUIT_FILES.acir)) ||
      existsSync(join(CIRCUIT_TARGET, CIRCUIT_FILES.bundle))
    );
  }

  private loadAbiFromCircuit(): Abi {
    const directories = [CIRCUIT_BUILD, CIRCUIT_TARGET];
    const files = [
      CIRCUIT_FILES.abi,
      CIRCUIT_FILES.circuit,
      CIRCUIT_FILES.bundle,
    ];

    for (const dir of directories) {
      for (const file of files) {
        const path = join(dir, file);
        if (!existsSync(path)) {
          continue;
        }
        try {
          const data = JSON.parse(readFileSync(path, 'utf-8'));
          if (data?.abi) {
            return data.abi as Abi;
          }
        } catch (error) {
          this.logger.warn(`Failed to parse ABI from ${path}: ${error}`);
        }
      }
    }

    return {
      parameters: [],
      return_type: null,
      error_types: {},
    };
  }

  private readManifest(): CircuitManifest | undefined {
    const manifestPath = join(CIRCUIT_BUILD, CIRCUIT_FILES.circuit);
    if (!existsSync(manifestPath)) {
      return undefined;
    }
    try {
      return JSON.parse(
        readFileSync(manifestPath, 'utf-8'),
      ) as CircuitManifest;
    } catch (error) {
      this.logger.warn(`Failed to parse circuit manifest: ${error}`);
      return undefined;
    }
  }

  private readOptionalBinary(fileName: string) {
    const target = join(CIRCUIT_BUILD, fileName);
    if (existsSync(target)) {
      return readFileSync(target);
    }
    return undefined;
  }

  async getCompiledCircuit() {
    if (!this.compiledCircuit) {
      await this.loadArtifacts();
    }
    return this.compiledCircuit!;
  }

  private buildCompiledCircuit(acir: Uint8Array): NoirCompiledCircuit {
    const bundlePath = join(CIRCUIT_TARGET, CIRCUIT_FILES.bundle);
    if (existsSync(bundlePath)) {
      const bundle = JSON.parse(readFileSync(bundlePath, 'utf-8'));
      return {
        bytecode: bundle.bytecode,
        abi: bundle.abi as Abi,
        debug_symbols: bundle.debug_symbols ?? '',
        file_map: bundle.file_map ?? {},
      };
    }

    return {
      bytecode: Buffer.from(acir).toString('base64'),
      abi: this.loadAbiFromCircuit(),
      debug_symbols: '',
      file_map: {},
    };
  }
}

type NoirCompiledCircuit = {
  bytecode: string;
  abi: Abi;
  debug_symbols: string;
  file_map: Record<string, unknown>;
};
