import { redis, ensureRedisConnection } from '../utils/redis';

export async function markTx(txHash: string): Promise<void> {
  await ensureRedisConnection();
  await redis.set(`tx:${txHash}`, '1', { EX: 3600 });
}

export async function isProcessed(txHash: string): Promise<boolean> {
  await ensureRedisConnection();
  const v = await redis.get(`tx:${txHash}`);
  return !!v;
}

