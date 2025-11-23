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
}
