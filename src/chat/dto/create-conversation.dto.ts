import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    required: false,
    description: 'Optional title to help FE label the conversation',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: [String],
    description: 'User IDs to be added to this conversation (excluding the requester)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participantIds!: string[];
}
