import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ description: 'Company display name' })
  @IsString()
  @MaxLength(140)
  companyName!: string;

  @ApiPropertyOptional({
    description:
      'Optional logo URL/IPFS CID. When uploading a logo file, this field is ignored and replaced with the new CID.',
  })
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiProperty({ description: 'Primary location shown to applicants' })
  @IsString()
  @MaxLength(140)
  location!: string;

  @ApiProperty({ description: 'Job type label (e.g., Full-time, Contract)' })
  @IsString()
  @MaxLength(60)
  jobType!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'List of requirement bullet points',
    example: ['3+ years React', 'Available CET hours'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((req) => req.trim())
        .filter((req) => req.length > 0);
    }
    return undefined;
  })
  requirements?: string[];

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minTrustScore!: number;

  @ApiProperty({ description: 'USDC reward', minimum: 1 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  reward!: number;

  @ApiPropertyOptional({ description: 'Minimum salary expectation (optional)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Maximum salary expectation (optional)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'ISO date string for closing date' })
  @IsOptional()
  @IsDateString()
  closeAt?: string;

  @ApiPropertyOptional({ description: 'Existing proof ID to reuse' })
  @IsOptional()
  @IsString()
  zkProofId?: string;
}
