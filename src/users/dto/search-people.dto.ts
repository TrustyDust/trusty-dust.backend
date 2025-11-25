import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsNumberString } from 'class-validator';

export class SearchPeopleQueryDto {
  @ApiPropertyOptional({ description: 'Free text keyword (username, job title)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @ApiPropertyOptional({ description: 'Filter by job title', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Filter by job type (Contract, Full-time, etc.)', maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  jobType?: string;

  @ApiPropertyOptional({ description: 'Pagination cursor (user id)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Page size (max 50)', default: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
