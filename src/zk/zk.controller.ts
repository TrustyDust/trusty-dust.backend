import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZkService } from './zk.service';
import { VerifyProofDto } from './dto/verify-proof.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/interfaces/request-user.interface';

@ApiTags('Zero Knowledge')
@ApiBearerAuth('backend-jwt')
@Controller('zk')
export class ZkController {
  constructor(private readonly zkService: ZkService) {}

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify Noir trust score proof on-chain and store result' })
  @ApiCreatedResponse({ description: 'Persisted proof record' })
  verify(@CurrentUser() user: RequestUser, @Body() dto: VerifyProofDto) {
    return this.zkService.verifyProof(user.id, dto);
  }
}
