import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListPostsQueryDto {
  @ApiPropertyOptional({ description: 'Cursor (last post id) for pagination' })
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of posts to fetch (default 10, max 20)',
    example: 10,
  })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of most recent comments to include per post (default 2, max 5)',
    example: 2,
  })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  commentPreviewLimit?: number;
}
