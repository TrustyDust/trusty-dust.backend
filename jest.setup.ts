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

jest.mock('@noir-lang/barretenberg', () => {
  class MockBarretenbergWasm {
    static async new() {
      return new MockBarretenbergWasm();
    }
    async initSRS() {}
  }

  class MockStandardProver {
    static async new() {
      return new MockStandardProver();
    }
    async prove() {
      return new Uint8Array();
    }
  }

  return {
    BarretenbergWasm: MockBarretenbergWasm,
    StandardProver: MockStandardProver,
  };
}, { virtual: true });
