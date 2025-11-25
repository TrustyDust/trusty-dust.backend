import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiScoringService } from '@/ai-scoring/ai-scoring.service';
import { GeminiClientService } from '@/ai-scoring/gemini-client.service';

@Module({
  imports: [ConfigModule],
  providers: [AiScoringService, GeminiClientService],
  exports: [AiScoringService],
})
export class AiScoringModule {}
