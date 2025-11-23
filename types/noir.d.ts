declare module '@noir-lang/noir_wasm' {
  export default function init(): Promise<void>;
  export class Noir {
    constructor(acir: Uint8Array);
    execute(input: Record<string, string>): Promise<{ witness: Uint8Array; returnValue: any }>;
  }
}

declare module '@noir-lang/barretenberg' {
  export class BarretenbergWasm {
    static new(): Promise<BarretenbergWasm>;
    initSRS(size: number): Promise<void>;
  }
  export class StandardProver {
    static new(
      wasm: BarretenbergWasm,
      acir: Uint8Array,
      provingKey: Uint8Array,
    ): Promise<StandardProver>;
    prove(witness: Uint8Array): Promise<Uint8Array>;
  }
}
