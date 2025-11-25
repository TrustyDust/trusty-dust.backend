export interface ZkWitnessInput {
  score: string;
  minScore: string;
}

export interface ZkProofResult {
  proof: string;
  publicInputs: string[];
}

export interface GenerateScoreProofPayload {
  score: number;
  minScore: number;
  userId?: string;
}

export interface VerifyProofPayload {
  proof: string;
  publicInputs: string[];
}
