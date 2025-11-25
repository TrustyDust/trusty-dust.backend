import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Conversation identifier (cuid)' })
  @IsString()
  conversationId!: string;

  @ApiProperty({ description: 'Plain text body of the chat message' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Optional list of media URLs/IPFS CIDs to attach',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({
    required: false,
    type: Object,
    description: 'Free-form metadata (ex: jobId reference, reply info)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
