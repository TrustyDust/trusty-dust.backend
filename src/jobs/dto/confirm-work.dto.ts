import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmWorkDto {
  @ApiPropertyOptional({ description: 'Optional on-chain transaction hash for escrow release' })
  @IsOptional()
  @IsString()
  txHash?: string;
}
