import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Simple heartbeat endpoint' })
  @ApiOkResponse({ description: 'Returns service status and timestamp' })
  getStatus() {
    return this.appService.getStatus();
  }

  @Get('supabase')
  @ApiOperation({ summary: 'Ping Supabase database connection' })
  @ApiOkResponse({ description: 'Supabase connectivity status' })
  @ApiQuery({
    name: 'table',
    required: false,
    description: 'Optional table name to use for the probe (defaults to SUPABASE_HEALTH_TABLE)',
  })
  testSupabase(@Query('table') table?: string) {
    return this.supabaseService.testConnection(table);
  }
}
