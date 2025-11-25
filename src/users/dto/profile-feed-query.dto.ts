import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ProfileFeedQueryDto {
  @ApiPropertyOptional({ description: 'Cursor (last entity id) for pagination' })
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Amount of records to return (default 5, max 20)',
    example: 5,
  })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}
