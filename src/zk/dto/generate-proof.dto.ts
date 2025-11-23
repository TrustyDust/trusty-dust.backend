import { IsInt, IsPositive, IsString } from 'class-validator';

export class GenerateProofDto {
  @IsString()
  userId!: string;

  @IsInt()
  @IsPositive()
  minScore!: number;
}
