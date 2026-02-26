import { config } from '../config/env';

export interface StarknetContractConfig {
  address: string;
  abi?: any; // Attach compiled Cairo 1 ABI JSON at runtime
}

type ContractKey =
  | 'mixer'
  | 'deposit'
  | 'withdraw'
  | 'merkle'
  | 'verifier'
  | 'btcBridge'
  | 'privateErc20'
  | 'privateDex'
  | 'zkIdentity'
  | 'pedersenHashLib'
  | 'poseidonHashLib';

export const CONTRACTS: Record<ContractKey, StarknetContractConfig> = {
  mixer: {
    address: config.get('MIXER_CONTRACT_ADDRESS')
  },
  // For many deployments the mixer contract exposes `deposit` and `withdraw`
  // entrypoints directly; keep these as aliases so callers can target them
  // explicitly when needed.
  deposit: {
    address: config.get('MIXER_CONTRACT_ADDRESS')
  },
  withdraw: {
    address: config.get('MIXER_CONTRACT_ADDRESS')
  },
  merkle: {
    address:
      config.get('MERKLE_CONTRACT_ADDRESS') ??
      config.get('MIXER_CONTRACT_ADDRESS')
  },
  verifier: {
    address: config.get('VERIFIER_CONTRACT_ADDRESS')
  },
  btcBridge: {
    address: config.get('BTC_BRIDGE_ADDRESS')
  },
  // Advanced privacy contracts – optional, fall back to mixer when unset.
  privateErc20: {
    address:
      config.get('PRIVATE_ERC20_ADDRESS') ??
      config.get('MIXER_CONTRACT_ADDRESS')
  },
  privateDex: {
    address:
      config.get('PRIVATE_DEX_ADDRESS') ??
      config.get('MIXER_CONTRACT_ADDRESS')
  },
  zkIdentity: {
    address:
      config.get('ZK_IDENTITY_ADDRESS') ??
      config.get('MIXER_CONTRACT_ADDRESS')
  },
  pedersenHashLib: {
    address:
      config.get('PEDERSEN_HASH_LIB_ADDRESS') ??
      config.get('MIXER_CONTRACT_ADDRESS')
  },
  poseidonHashLib: {
    address:
      config.get('POSEIDON_HASH_LIB_ADDRESS') ??
      config.get('MIXER_CONTRACT_ADDRESS')
  }
};

