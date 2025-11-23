import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  minTrustScore!: number;

  @ApiProperty({ description: 'USDC reward', minimum: 1 })
  @IsInt()
  @IsPositive()
  reward!: number;

  @ApiPropertyOptional({ description: 'Existing proof ID to reuse' })
  @IsOptional()
  @IsString()
  zkProofId?: string;
}
