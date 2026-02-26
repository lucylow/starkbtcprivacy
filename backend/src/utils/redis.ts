import { createClient } from 'redis';
import { config } from '../config/env';
import { logger } from './logger';

const client = createClient({
  url: config.get('REDIS_URL')
});

client.on('error', (err) => {
  logger.error({ err }, 'Redis client error');
});

client.on('connect', () => {
  logger.info('Redis connected');
});

export const redis = client;

export async function ensureRedisConnection(): Promise<void> {
  if (!client.isOpen) {
    await client.connect();
  }
}

