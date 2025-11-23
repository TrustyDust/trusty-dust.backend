import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class BoostPostDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ description: 'Optional memo for burn boost' })
  @IsOptional()
  @IsString()
  note?: string;
}
