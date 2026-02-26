import { RpcProvider } from 'starknet';
import { config } from '../config/env';

export const STARKNET_NETWORK =
  process.env.STARKNET_NETWORK ?? 'sepolia';

export const provider = new RpcProvider({
  nodeUrl:
    config.get('STARKNET_RPC_URL') ||
    (STARKNET_NETWORK === 'mainnet'
      ? 'https://starknet-mainnet.public.blastapi.io'
      : 'https://starknet-sepolia.public.blastapi.io')
});

