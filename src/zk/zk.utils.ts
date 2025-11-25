import { gunzipSync } from 'zlib';
import { readFileSync } from 'fs';
import { join } from 'path';

export const CIRCUIT_ROOT = join(process.cwd(), 'circuits', 'wallet_score');
export const CIRCUIT_BUILD = join(CIRCUIT_ROOT, 'build');

export const CIRCUIT_FILES = {
  acir: 'wallet_score.acir.gz',
  abi: 'wallet_score.json',
  circuit: 'circuit.json',
  provingKey: 'wallet_score.proving_key',
  verificationKey: 'wallet_score.verification_key',
};

export function readBuildFile(fileName: string) {
  return readFileSync(join(CIRCUIT_BUILD, fileName));
}

export function readAcirBuffer() {
  const compressed = readBuildFile(CIRCUIT_FILES.acir);
  return gunzipSync(compressed);
}

export function bufferToHex(buffer: Uint8Array | Buffer) {
  return `0x${Buffer.from(buffer).toString('hex')}`;
}
