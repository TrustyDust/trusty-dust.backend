jest.mock('@noir-lang/noir_wasm', () => {
  class MockNoir {
    constructor() {}
    async execute() {
      return { witness: new Uint8Array(), returnValue: ['1'] };
    }
  }

  return {
    __esModule: true,
    default: () => Promise.resolve(),
    Noir: MockNoir,
  };
}, { virtual: true });

jest.mock('@noir-lang/backend_barretenberg', () => {
  return {
    BarretenbergBackend: jest.fn().mockImplementation(() => ({
      generateProof: jest.fn().mockResolvedValue({ proof: new Uint8Array(), publicInputs: ['1'] }),
    })),
  };
}, { virtual: true });

jest.mock('@supabase/supabase-js', () => {
  const channelMock = {
    subscribe: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue('ok'),
    unsubscribe: jest.fn().mockResolvedValue('ok'),
  };

  return {
    createClient: jest.fn(() => ({
      channel: jest.fn(() => ({
        ...channelMock,
      })),
    })),
  };
});
