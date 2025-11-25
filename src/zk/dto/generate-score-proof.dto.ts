import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class GenerateScoreProofDto {
  @IsInt()
  @Min(0)
  score!: number;

  @IsInt()
  @IsPositive()
  minScore!: number;

  @IsOptional()
  @IsString()
  userId?: string;
}
