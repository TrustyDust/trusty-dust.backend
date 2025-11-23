import { gunzipSync } from 'zlib';
import { readFileSync } from 'fs';
import { join } from 'path';

export const CIRCUIT_ROOT = join(process.cwd(), 'circuits', 'trust_score');
export const CIRCUIT_BUILD = join(CIRCUIT_ROOT, 'build');

export const CIRCUIT_FILES = {
  acir: 'trust_score.acir.gz',
  circuit: 'circuit.json',
  provingKey: 'trust_score.proving_key',
  verificationKey: 'trust_score.verification_key',
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
