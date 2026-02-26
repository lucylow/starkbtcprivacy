import { poseidon } from 'poseidon-encryption';
import { BigNumberish } from 'starknet';

export class PoseidonHasher {
  // Prime is kept for reference; poseidon-encryption handles field ops internally.
  private readonly prime: bigint;

  constructor() {
    this.prime = BigInt(
      '3618502788666131213697322783095070105623107215331596699973092056135872020481'
    );
  }

  hash(inputs: BigNumberish[]): bigint {
    const bigIntInputs = inputs.map((input) =>
      typeof input === 'string' ? BigInt(input) : BigInt(input as any)
    );
    return poseidon(bigIntInputs as any);
  }

  hashTwo(a: BigNumberish, b: BigNumberish): bigint {
    return this.hash([a, b]);
  }

  hashMany(inputs: BigNumberish[]): bigint {
    return this.hash(inputs);
  }
}

export const poseidonHasher = new PoseidonHasher();

