import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WalletReputationService } from './wallet-reputation.service';
import { AnalyzeWalletDto } from './dto/analyze-wallet.dto';
import { WalletReputationResponseDto } from './dto/wallet-reputation-response.dto';

@ApiTags('Wallet Reputation')
@ApiBearerAuth('backend-jwt')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@Controller('wallet-reputation')
export class WalletReputationController {
  constructor(private readonly service: WalletReputationService) {}

  @Post('analyze')
  @Throttle({ walletAnalyze: { limit: 10, ttl: 300 } })
  @ApiOperation({ summary: 'Analyze wallet reputation using on-chain heuristics' })
  @ApiBody({ type: AnalyzeWalletDto })
  @ApiOkResponse({ description: 'Reputation snapshot stored', type: WalletReputationResponseDto })
  analyze(@Body() dto: AnalyzeWalletDto) {
    return this.service.analyzeWallet(dto);
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get latest wallet reputation snapshot' })
  @ApiOkResponse({ description: 'Wallet reputation entry', type: WalletReputationResponseDto })
  getLatest(@Param('address') address: string, @Query('chainId', ParseIntPipe) chainId: number) {
    return this.service.getLatest(address, chainId);
  }
}
