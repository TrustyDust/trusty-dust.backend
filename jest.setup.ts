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
