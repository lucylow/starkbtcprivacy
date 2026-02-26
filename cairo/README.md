# Zephyr Protocol (Cairo 2.11+)

**ZK Bitcoin Privacy Mixer on Starknet** — Quantum-resistant privacy for BTC DeFi using STARK proofs.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Zephyr Protocol                     │
├──────────────┬──────────────┬────────────────────────┤
│ ZephyrMixer  │ ZephyrVerifier│ ZephyrMerkleTree      │
│ (core mixer) │ (ZK proofs)  │ (commitment storage)   │
├──────────────┴──────────────┴────────────────────────┤
│              ZephyrDAO (governance)                   │
└─────────────────────────────────────────────────────┘
```

### Contracts

| Contract | Description |
|----------|-------------|
| **ZephyrMixer** | Core mixer: deposit (ERC20 + commitment), withdraw (ZK proof + nullifier). Incremental Merkle tree, fee system, pause/admin controls. |
| **ZephyrVerifier** | ZK proof verification. STWO integration point. Validates withdrawal proofs against public inputs [root, nullifier, recipient, amount]. |
| **ZephyrMerkleTree** | Standalone on-chain Merkle tree (depth 20, ~1M leaves). Used by root relayers and DAO governance. |
| **ZephyrDAO** | Proposal lifecycle, snapshot-based voting, timelock execution with per-action calldata. |

### Interfaces

| Interface | Description |
|-----------|-------------|
| `IMixer` | Full mixer interface: deposit, withdraw, batch_deposit, admin functions |
| `IVerifier` | Proof verification: verify_proof, batch_verify |
| `IERC20` | Standard ERC20 for strkBTC/wBTC token interactions |
| `IGovToken` | Governance token with snapshot voting (get_past_votes) |

### Libraries

| Library | Description |
|---------|-------------|
| `poseidon_utils` | Poseidon hashing: commitment generation, nullifier derivation |
| `merkle_tree` | Merkle proof verification, zero hash computation |

## Build

```bash
cd cairo
scarb build
```

## Test

```bash
cd cairo
scarb test
```

## Deploy

```bash
cd cairo
export ADMIN_ADDRESS="0x..."
export TOKEN_ADDRESS="0x..."  # strkBTC address
export FEE_RECIPIENT="0x..."
chmod +x deploy.sh
./deploy.sh
```

## Privacy Flow

1. **Deposit**: User generates `(secret, nullifier, randomness)` off-chain, computes `commitment = Poseidon(secret, nullifier, amount_low, amount_high, randomness)`, approves ERC20 spend, calls `deposit(commitment, amount_low, amount_high)`.

2. **Wait**: Commitment is added to the Merkle tree. User waits for anonymity set to grow.

3. **Withdraw**: User computes `nullifier_hash = Poseidon(secret, leaf_index)`, generates ZK proof showing knowledge of a valid commitment, calls `withdraw(nullifier_hash, recipient, amount, merkle_root, proof)`.

4. **Verification**: Verifier contract checks the STARK proof. Nullifier is marked spent (preventing double-spend). Tokens transferred to recipient minus fee.

## Security

- **Double-spend prevention**: Nullifier hashes are recorded on-chain; each commitment can only be withdrawn once.
- **Quantum resistance**: STARK proofs are not vulnerable to quantum attacks (unlike SNARKs).
- **Non-custodial**: Users always control their funds via their secret.
- **Fee cap**: Maximum fee is 10% (1000 bps), enforced in constructor.
- **Historical roots**: Ring buffer of 100 roots prevents front-running attacks.
