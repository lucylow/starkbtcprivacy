// src/mock/utxo.ts

import { mulberry32, randomHex, randomBigInt, daysAgo } from "./utils";
import { MockUtxo, MockUtxoTreeSnapshot, Hex } from "./types";

/**
 * Create a fake Merkle root given a list of leaves.
 * This is NOT cryptographically correct; it is only for UI demos.
 */
export function mockMerkleRoot(leaves: Hex[]): Hex {
  // Just hash by XOR-ing chars length; purely cosmetic.
  const joined = leaves.join("");
  let acc = 0;
  for (let i = 0; i < joined.length; i++) {
    acc ^= joined.charCodeAt(i);
  }
  return (`0x${acc.toString(16).padStart(64, "0")}`) as Hex;
}

/**
 * Generate a realistic cluster of UTXOs for one user.
 */
export function createMockUtxosForUser(
  userAddress: Hex,
  count: number,
  seed = 2024,
  tokenSymbol = "wBTC",
): MockUtxo[] {
  const rng = mulberry32(seed);
  const result: MockUtxo[] = [];
  for (let i = 0; i < count; i++) {
    const commitment = randomHex(rng);
    const nullifier = randomHex(rng);
    const merkleIndex = i;
    const amount = randomBigInt(rng, BigInt(10_000_000)); // up to 0.1 BTC in sats
    const createdAt = daysAgo(7 - i); // spread over last week
    const spent = rng() > 0.6; // ~40% unspent
    const spentTxHash = spent ? randomHex(rng) : undefined;
    const note = `UTXO #${i} for ${userAddress.slice(0, 8)}…`;

    result.push({
      id: `${userAddress}-${i}`,
      commitment,
      nullifier,
      merkleIndex,
      amount,
      tokenSymbol,
      createdAt,
      spent,
      spentTxHash,
      note,
    });
  }
  return result;
}

/**
 * Create a snapshot of the UTXO tree given a full set of leaves.
 */
export function createMockUtxoTreeSnapshot(
  utxos: MockUtxo[],
  depth = 20,
): MockUtxoTreeSnapshot {
  const leaves = utxos
    .sort((a, b) => a.merkleIndex - b.merkleIndex)
    .map((u) => u.commitment);

  return {
    root: mockMerkleRoot(leaves),
    depth,
    leaves,
    createdAt: Date.now(),
  };
}

/**
 * Utility helper to aggregate balances by token.
 */
export function aggregateBalance(utxos: MockUtxo[]): Record<string, bigint> {
  return utxos.reduce<Record<string, bigint>>((acc, u) => {
    if (u.spent) return acc;
    const key = u.tokenSymbol;
    const prev = acc[key] ?? 0n;
    acc[key] = prev + u.amount;
    return acc;
  }, {});
}


