import { redis, ensureRedisConnection } from '../utils/redis';

const DEFAULT_TTL_SECONDS = 60 * 60; // 1 hour

export async function markTxProcessed(txHash: string, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
  await ensureRedisConnection();
  await redis.set(`starknet:tx:${txHash}`, '1', {
    EX: ttlSeconds
  });
}

export async function isTxProcessed(txHash: string): Promise<boolean> {
  await ensureRedisConnection();
  const val = await redis.get(`starknet:tx:${txHash}`);
  return val === '1';
}

