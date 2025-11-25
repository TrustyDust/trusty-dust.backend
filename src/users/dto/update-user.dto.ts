import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ minLength: 3, maxLength: 32 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username?: string;

  @ApiPropertyOptional({ description: 'Avatar URL (https://...)' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatar?: string;

  @ApiPropertyOptional({ description: 'Displayed job title/headline', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Preferred job type (Contract, Full-time, etc.)', maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  jobType?: string;
}
