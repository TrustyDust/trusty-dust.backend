import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReactionAction {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  REPOST = 'REPOST',
}

export class ReactPostDto {
  @ApiProperty({ enum: ReactionAction })
  @IsEnum(ReactionAction)
  type!: ReactionAction;

  @ApiPropertyOptional({ maxLength: 300, description: 'Filled only when type=COMMENT' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  commentText?: string;
}
