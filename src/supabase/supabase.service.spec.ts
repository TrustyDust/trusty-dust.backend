import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { createClient } from '@supabase/supabase-js';

describe('SupabaseService', () => {
  const configMock = (values: Record<string, string | undefined>) => ({
    get: jest.fn((key: string) => values[key]),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns disabled result when credentials missing', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SupabaseService,
        { provide: ConfigService, useValue: configMock({}) },
      ],
    }).compile();

    const service = moduleRef.get(SupabaseService);
    const result = await service.testConnection();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not configured/i);
  });

  it('returns ok when Supabase responds without error', async () => {
    const limitMock = jest.fn().mockResolvedValue({ data: [], error: null });
    const selectMock = jest.fn().mockReturnValue({ limit: limitMock });
    (createClient as jest.Mock).mockImplementationOnce(() => ({
      from: jest.fn(() => ({ select: selectMock })),
      channel: jest.fn(),
    }));

    const moduleRef = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: configMock({
            SUPABASE_URL: 'https://example.supabase.co',
            SUPABASE_SERVICE_ROLE_KEY: 'secret',
            SUPABASE_HEALTH_TABLE: 'ChatMessage',
          }),
        },
      ],
    }).compile();
    const service = moduleRef.get(SupabaseService);

    const result = await service.testConnection('custom');
    expect(result.ok).toBe(true);
    expect(result.table).toBe('custom');
    expect(limitMock).toHaveBeenCalledWith(1);
  });

  it('bubbles up Supabase errors', async () => {
    const limitMock = jest.fn().mockResolvedValue({ error: { message: 'boom' } });
    const selectMock = jest.fn().mockReturnValue({ limit: limitMock });
    (createClient as jest.Mock).mockImplementationOnce(() => ({
      from: jest.fn(() => ({ select: selectMock })),
      channel: jest.fn(),
    }));

    const moduleRef = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: configMock({
            SUPABASE_URL: 'https://example.supabase.co',
            SUPABASE_SERVICE_ROLE_KEY: 'secret',
          }),
        },
      ],
    }).compile();

    const service = moduleRef.get(SupabaseService);
    const result = await service.testConnection();

    expect(result.ok).toBe(false);
    expect(result.error).toBe('boom');
  });
});
