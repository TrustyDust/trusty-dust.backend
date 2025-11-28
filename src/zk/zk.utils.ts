import { gunzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CIRCUIT_ROOT = join(process.cwd(), 'circuits', 'wallet_score');
export const CIRCUIT_BUILD = join(CIRCUIT_ROOT, 'build');
export const CIRCUIT_TARGET = join(CIRCUIT_ROOT, 'target');

export const CIRCUIT_FILES = {
  acir: 'wallet_score.acir.gz',
  abi: 'wallet_score.json',
  circuit: 'circuit.json',
  provingKey: 'wallet_score.proving_key',
  verificationKey: 'wallet_score.verification_key',
  bundle: 'wallet_score.json',
};

export function readAcirBuffer() {
  const buildArtifact = join(CIRCUIT_BUILD, CIRCUIT_FILES.acir);
  if (existsSync(buildArtifact)) {
    return gunzipSync(readFileSync(buildArtifact));
  }

  const targetBundle = join(CIRCUIT_TARGET, CIRCUIT_FILES.bundle);
  if (existsSync(targetBundle)) {
    const bundle = JSON.parse(readFileSync(targetBundle, 'utf-8'));
    const compressed = Buffer.from(bundle.bytecode, 'base64');
    return gunzipSync(compressed);
  }

  throw new Error(
    `Missing Noir circuit artifacts. Run "nargo check && nargo compile" under ${CIRCUIT_ROOT} to generate build files.`,
  );
}

export function bufferToHex(buffer: Uint8Array | Buffer) {
  return `0x${Buffer.from(buffer).toString('hex')}`;
}
