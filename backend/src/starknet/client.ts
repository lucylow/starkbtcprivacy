import { provider } from './provider';
import { logger } from '../utils/logger';

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
    logger.error(
      { error, txHash },
      'Failed to fetch Starknet transaction receipt'
    );
    throw error;
  }
}

