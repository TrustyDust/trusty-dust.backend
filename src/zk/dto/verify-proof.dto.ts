import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class VerifyProofDto {
  @ApiProperty({ description: 'Compiled Noir proof bytes (0x...)' })
  @IsString()
  proof!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  minScore!: number;

  @ApiProperty({ type: [String], description: 'Serialized public inputs for the proof' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  publicInputs!: string[];

  @ApiPropertyOptional({ description: 'Optional transaction hash if proof verified on-chain prior to storing' })
  @IsOptional()
  @IsString()
  txHash?: string;
}
