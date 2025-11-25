import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsNumberString } from 'class-validator';

export class SearchJobsQueryDto {
  @ApiPropertyOptional({ description: 'Keyword to match title/company/description', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  keyword?: string;

  @ApiPropertyOptional({ description: 'Filter by job type', maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  jobType?: string;

  @ApiPropertyOptional({ description: 'Filter by job title', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Pagination cursor (job id)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Page size (max 50)', default: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
