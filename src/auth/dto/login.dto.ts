import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ description: 'Privy-issued JWT token if Authorization header is not used' })
  @IsOptional()
  @IsString()
  privyToken?: string;
}
