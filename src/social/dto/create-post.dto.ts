import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  text!: string;

  @ApiPropertyOptional({ description: 'Optional IPFS CID if content stored off-chain' })
  @IsOptional()
  @IsString()
  ipfsCid?: string;

  @ApiPropertyOptional({ type: [String], description: 'Optional array of media URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
