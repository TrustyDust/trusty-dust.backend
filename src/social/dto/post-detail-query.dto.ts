import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PostDetailQueryDto {
  @ApiPropertyOptional({
    description: 'Number of comments to include (default 20, max 50)',
    example: 20,
  })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  commentsLimit?: number;
}
