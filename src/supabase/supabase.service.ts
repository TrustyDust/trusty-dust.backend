import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseHealthResult {
  ok: boolean;
  table?: string;
  latencyMs?: number;
  error?: string;
}

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabase?: SupabaseClient;
  private readonly defaultTable: string;

  constructor(private readonly config: ConfigService) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.defaultTable = this.config.get<string>('SUPABASE_HEALTH_TABLE') ?? 'ChatMessage';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      this.logger.log('Supabase client initialised for health checks');
    } else {
      this.logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Supabase health checks disabled.');
    }
  }

  get isEnabled() {
    return Boolean(this.supabase);
  }

  async testConnection(table?: string): Promise<SupabaseHealthResult> {
    if (!this.supabase) {
      return {
        ok: false,
        error: 'Supabase client not configured. Provide SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY.',
      };
    }

    const targetTable = table?.trim() || this.defaultTable;
    const started = Date.now();
    try {
      const { error } = await this.supabase
        .from(targetTable)
        .select('*', { head: true, count: 'estimated' })
        .limit(1);

      const latencyMs = Date.now() - started;
      if (error) {
        this.logger.error(`Supabase ping failed for table ${targetTable}`, error);
        return { ok: false, table: targetTable, latencyMs, error: error.message };
      }

      return { ok: true, table: targetTable, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - started;
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Supabase ping threw for table ${targetTable}`, error as Error);
      return { ok: false, table: targetTable, latencyMs, error: message };
    }
  }
}
