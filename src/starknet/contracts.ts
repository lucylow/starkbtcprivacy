export interface StarknetContractConfig {
  address: string;
  abi?: any; // Attach compiled Cairo 1 ABI JSON here
}

/**
 * Frontend contract addresses.
 * 
 * The mixer contract exposes deposit() and withdraw() entrypoints directly,
 * so deposit/withdraw/mixer all share the same address.
 * 
 * Set these via environment variables:
 *   VITE_MIXER_CONTRACT    - Main mixer contract (also used for deposit/withdraw)
 *   VITE_VERIFIER_CONTRACT - ZK proof verifier
 *   VITE_MERKLE_CONTRACT   - Merkle tree contract (optional, falls back to mixer)
 */
export const CONTRACTS: Record<
  "mixer" | "deposit" | "withdraw" | "merkle" | "verifier",
  StarknetContractConfig
> = {
  mixer: {
    address: import.meta.env.VITE_MIXER_CONTRACT ?? "",
  },
  deposit: {
    address: import.meta.env.VITE_MIXER_CONTRACT ?? import.meta.env.VITE_DEPOSIT_CONTRACT ?? "",
  },
  withdraw: {
    address: import.meta.env.VITE_MIXER_CONTRACT ?? import.meta.env.VITE_WITHDRAW_CONTRACT ?? "",
  },
  merkle: {
    address: import.meta.env.VITE_MERKLE_CONTRACT ?? import.meta.env.VITE_MIXER_CONTRACT ?? "",
  },
  verifier: {
    address: import.meta.env.VITE_VERIFIER_CONTRACT ?? "",
  },
};
