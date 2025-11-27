import { ApiProperty } from '@nestjs/swagger';

export class WalletScoreBreakdownDto {
  @ApiProperty({ description: 'Transaction factor score (0-1000)' })
  txnScore!: number;

  @ApiProperty({ description: 'Token holding diversification score' })
  tokenScore!: number;

  @ApiProperty({ description: 'NFT exposure score' })
  nftScore!: number;

  @ApiProperty({ description: 'DeFi participation score' })
  defiScore!: number;

  @ApiProperty({ description: 'Smart contract interaction score' })
  contractScore!: number;
}

export class WalletReputationResponseDto {
  @ApiProperty({ description: 'Lowercased wallet address' })
  address!: string;

  @ApiProperty({ description: 'Chain identifier (e.g. 1 for Ethereum)' })
  chainId!: number;

  @ApiProperty({ description: 'Aggregate score (0-1000)' })
  score!: number;

  @ApiProperty({ description: 'Tier label derived from the score' })
  tier!: string;

  @ApiProperty({ description: 'Overall risk score (lower is safer)' })
  riskScore!: number;

  @ApiProperty({ type: WalletScoreBreakdownDto })
  breakdown!: WalletScoreBreakdownDto;

  @ApiProperty({
    description: 'Associated zero-knowledge proof ID when score meets threshold',
    nullable: true,
  })
  zkProofId!: string | null;

  @ApiProperty({
    description: 'Optional reasoning/explanation for the score',
    required: false,
  })
  reasoning?: string;
}

