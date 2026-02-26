export interface StarknetContractConfig {
  address: string;
  abi?: any; // Attach compiled Cairo 1 ABI JSON here
}

export const CONTRACTS: Record<
  "deposit" | "withdraw" | "merkle",
  StarknetContractConfig
> = {
  deposit: {
    address: import.meta.env.VITE_DEPOSIT_CONTRACT as string,
  },
  withdraw: {
    address: import.meta.env.VITE_WITHDRAW_CONTRACT as string,
  },
  merkle: {
    address: import.meta.env.VITE_MERKLE_CONTRACT as string,
  },
};

