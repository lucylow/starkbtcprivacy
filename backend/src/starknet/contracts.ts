import { config } from '../config/env';

export interface StarknetContractConfig {
  address: string;
  abi?: any; // Attach compiled Cairo 1 ABI JSON at runtime
}

export const CONTRACTS: Record<
  'mixer' | 'verifier' | 'btcBridge',
  StarknetContractConfig
> = {
  mixer: {
    address: config.get('MIXER_CONTRACT_ADDRESS')
  },
  verifier: {
    address: config.get('VERIFIER_CONTRACT_ADDRESS')
  },
  btcBridge: {
    address: config.get('BTC_BRIDGE_ADDRESS')
  }
};

import { config } from '../config/env';

export const CONTRACTS = {
  mixer: {
    address: config.get('MIXER_CONTRACT_ADDRESS')
  },
  deposit: {
    // Alias mixer for deposit entrypoint by default
    address: config.get('MIXER_CONTRACT_ADDRESS')
  },
  withdraw: {
    // Alias mixer for withdraw entrypoint by default
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
  }
};

