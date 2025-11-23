export interface ZkWitnessInput {
  userScore: string;
  minScore: string;
}

export interface ZkProofResult {
  proof: string;
  publicInputs: string[];
}

export interface GenerateProofPayload {
  userId: string;
  minScore: number;
}

export interface VerifyProofPayload {
  proof: string;
  publicInputs: string[];
}
