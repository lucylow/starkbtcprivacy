import { hash, num, uint256, BigNumberish } from 'starknet';

/**
 * Pedersen-hash based helpers that mirror the Cairo implementations used
 * by the on-chain privacy contracts.
 *
 * All helpers return hex strings (0x-prefixed) so they can be passed
 * directly into Starknet transactions and stored in the database.
 */

// Domain separators – must exactly match the Cairo contract constants.
// "SNIP_COMMITMENT"
const COMMITMENT_DOMAIN =
  '0x534e49505f434f4d4d49544d454e54';
// "SNIP_NULLIFIER"
const NULLIFIER_DOMAIN =
  '0x534e49505f4e554c4c4946494552';

function toHex(value: BigNumberish): string {
  return num.toHex(value);
}

/**
 * Single Pedersen hash of two field elements.
 */
export function pedersenHashPair(a: BigNumberish, b: BigNumberish): string {
  return hash.pedersen([toHex(a), toHex(b)]);
}

/**
 * Pedersen hash over an array of field elements using Merkle–Damgård style
 * chaining, matching the Cairo `hash_array` helper.
 */
export function pedersenHashArray(values: BigNumberish[]): string {
  let state = '0x0';
  for (const v of values) {
    state = pedersenHashPair(state, v);
  }
  return state;
}

/**
 * Generate a commitment for a shielded UTXO:
 *
 *   C = H(H(secret, nullifier), amount_low, amount_high, randomness, COMMITMENT_DOMAIN)
 *
 * where `amount` is a u256.
 */
export function generateCommitment(params: {
  secret: BigNumberish;
  nullifier: BigNumberish;
  amount: bigint;
  randomness: BigNumberish;
}): string {
  const { secret, nullifier, amount, randomness } = params;

  const u = uint256.bnToUint256(amount);
  const amountLow = u.low;
  const amountHigh = u.high;

  const hash1 = pedersenHashPair(secret, nullifier);
  const hash2 = pedersenHashPair(hash1, amountLow);
  const hash3 = pedersenHashPair(hash2, amountHigh);
  const hash4 = pedersenHashPair(hash3, randomness);
  const finalHash = pedersenHashPair(hash4, COMMITMENT_DOMAIN);

  return finalHash;
}

/**
 * Generate a nullifier as in the Cairo library:
 *
 *   N = H(H(secret, NULLIFIER_DOMAIN), index)
 */
export function generateNullifier(params: {
  secret: BigNumberish;
  index: bigint;
}): string {
  const { secret, index } = params;
  const hash1 = pedersenHashPair(secret, NULLIFIER_DOMAIN);
  const nullifier = pedersenHashPair(hash1, index);
  return nullifier;
}

/**
 * Hash with multiple rounds of Pedersen chaining, used to derive
 * additional pseudorandom material (e.g. for key stretching).
 */
export function pedersenHashRounds(
  input: BigNumberish,
  rounds: number
): string {
  let current = toHex(input);
  for (let i = 0; i < rounds; i++) {
    current = pedersenHashPair(current, BigInt(i));
  }
  return current;
}

/**
 * Deterministic blinding factor derived from a secret and nonce.
 */
export function generateBlindingFactor(params: {
  secret: BigNumberish;
  nonce: bigint;
}): string {
  const { secret, nonce } = params;
  return pedersenHashPair(secret, nonce);
}

/**
 * Pedersen range-proof style commitment:
 *
 *   C = H(H(H(value_low, value_high), blinding), bits)
 *
 * This mirrors the Cairo `range_commitment` helper so that off-chain
 * and on-chain commitments are identical.
 */
export function rangeCommitment(params: {
  value: bigint;
  blinding: BigNumberish;
  bits: number;
}): string {
  const { value, blinding, bits } = params;
  const u = uint256.bnToUint256(value);
  const valueLow = u.low;
  const valueHigh = u.high;

  const hash1 = pedersenHashPair(valueLow, valueHigh);
  const hash2 = pedersenHashPair(hash1, blinding);
  const commitment = pedersenHashPair(hash2, BigInt(bits));

  return commitment;
}

