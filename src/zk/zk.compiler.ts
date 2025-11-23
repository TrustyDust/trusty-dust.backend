import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CIRCUIT_BUILD, CIRCUIT_FILES, readAcirBuffer } from './zk.utils';

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

  async onModuleInit() {
    try {
      await this.loadArtifacts();
    } catch (error) {
      this.logger.warn(`Unable to eagerly load circuit artifacts: ${error}`);
    }
  }

  async loadArtifacts() {
    this.acir = readAcirBuffer();
    this.circuitManifest = JSON.parse(
      readFileSync(join(CIRCUIT_BUILD, CIRCUIT_FILES.circuit), 'utf-8'),
    ) as CircuitManifest;
    this.provingKey = readFileSync(join(CIRCUIT_BUILD, CIRCUIT_FILES.provingKey));
    this.verificationKey = readFileSync(join(CIRCUIT_BUILD, CIRCUIT_FILES.verificationKey));
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
    return this.provingKey!;
  }

  async getVerificationKey() {
    if (!this.verificationKey) {
      await this.loadArtifacts();
    }
    return this.verificationKey!;
  }

  hasBuildArtifacts() {
    return existsSync(join(CIRCUIT_BUILD, CIRCUIT_FILES.acir));
  }
}
