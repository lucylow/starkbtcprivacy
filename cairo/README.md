# Zephyr DAO (Cairo 2)

Governance layer for the Starknet privacy stack: proposal lifecycle, **snapshot-based voting** (`get_past_votes`), and timelock execution with per-action calldata.

## Snapshot voting

- **IGovToken** requires `balance_of`, `total_supply`, and **`get_past_votes(account, block_number)`**.
- The DAO stores `creation_block` per proposal and uses **voting power at that block** for:
  - Proposer check in `create_proposal`
  - Vote weight in `cast_vote`
  - Cancel check (proposer lost power) in `cancel`
- For tokens without checkpoints, implement `get_past_votes` as:  
  `if block_number >= get_block_number() { balance_of(account) } else { 0 }`.  
  For Compound-style tokens, return the checkpointed balance at `block_number`.

## Build

From this directory:

```bash
scarb build
```

## Proposal calldata layout

- **targets**: contract addresses to call.
- **values**: u256 per action (often `0` on Starknet).
- **selectors**: Starknet selector per action (e.g. `getSelectorFromName('set_root')`).
- **calldata_flattened**: concatenation of all actions’ calldata (felt252 strings).
- **calldata_lengths**: `[len1, len2, ...]` so action `i` uses `calldata_flattened[sum(lengths[0..i]) .. sum(lengths[0..i+1])]`.

TypeScript helpers and examples (Merkle `set_root`, ERC20/DEX admin) live in **`src/dao/proposalExamples.ts`**.
