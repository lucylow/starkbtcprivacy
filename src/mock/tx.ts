// src/mock/tx.ts

import { mulberry32, randomAddress, randomHex, minutesAgo } from "./utils";
import { MockTx, Hex } from "./types";

const METHODS = [
  "deposit",
  "private_transfer",
  "burn",
  "mint_with_proof",
  "create_proposal",
  "cast_vote",
  "queue",
  "execute",
];

export function createMockTxHistoryForAddress(
  address: Hex,
  count = 40,
  seed = 123,
): MockTx[] {
  const rng = mulberry32(seed);
  const txs: MockTx[] = [];

  for (let i = 0; i < count; i++) {
    const method = METHODS[Math.floor(rng() * METHODS.length)];
    const incoming = rng() > 0.5;
    const from = incoming ? randomAddress(rng) : address;
    const to = incoming ? address : randomAddress(rng);
    const statusRoll = rng();
    const status =
      statusRoll < 0.1 ? "PENDING" : statusRoll < 0.95 ? "ACCEPTED_ON_L2" : "REJECTED";

    const timestamp = minutesAgo(5 * i + Math.floor(rng() * 10));
    const feePaid = BigInt(Math.floor(rng() * 10_000_000_000)); // arbitrary units
    const calldataSummary = `method=${method}`;

    txs.push({
      hash: randomHex(rng),
      from,
      to,
      method,
      status,
      timestamp,
      feePaid,
      calldataSummary,
      label: incoming ? "Incoming" : "Outgoing",
    });
  }

  return txs;
}


