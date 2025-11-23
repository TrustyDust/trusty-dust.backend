import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class TrustEventDto {
  @ApiProperty({ description: 'Source label for the trust delta' })
  @IsString()
  source!: string;

  @ApiProperty({ description: 'Positive or negative delta applied to trust score' })
  @IsInt()
  delta!: number;
}
