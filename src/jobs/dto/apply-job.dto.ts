import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApplyJobDto {
  @ApiPropertyOptional({ description: 'Proof ID satisfying job minTrustScore' })
  @IsOptional()
  @IsString()
  zkProofId?: string;
}
