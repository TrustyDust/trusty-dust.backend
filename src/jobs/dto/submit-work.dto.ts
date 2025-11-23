import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class SubmitWorkDto {
  @ApiProperty({ maxLength: 4000, description: 'Worker submission notes / deliverable summary' })
  @IsString()
  @MaxLength(4000)
  workSubmissionText!: string;
}
