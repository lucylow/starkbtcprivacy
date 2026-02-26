import { RpcProvider } from 'starknet';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const rpcUrl = config.get('STARKNET_RPC_URL');

export const provider = new RpcProvider({
  nodeUrl: rpcUrl
});

export async function getLatestBlock() {
  try {
    return await provider.getBlock('latest');
  } catch (error) {
    logger.error({ error }, 'Failed to fetch latest Starknet block');
    throw error;
  }
}

export async function getTransactionReceipt(txHash: string) {
  try {
    return await provider.getTransactionReceipt(txHash);
  } catch (error) {
    logger.error({ error, txHash }, 'Failed to fetch Starknet transaction receipt');
    throw error;
  }
}

import { provider } from './provider';

export async function getLatestBlock() {
  return provider.getBlock('latest');
}

export async function getTransaction(txHash: string) {
  return provider.getTransactionReceipt(txHash);
}

