import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class VerifyCalldataDto {
  @IsString()
  proof!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  publicInputs!: string[];
}
