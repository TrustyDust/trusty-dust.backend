export interface RequestUser {
  id: string;
  walletAddress: string;
  username?: string | null;
  tier: string;
  trustScore?: number;
}
