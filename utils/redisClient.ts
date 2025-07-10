// file: utils/redisClient.ts
import { createClient } from 'redis';
import logger from './logger';

const redis = createClient({ url: process.env.REDIS_URL });

redis.on('error', (err) => logger.error({ err }, 'Redis Client Error'));

// This function ensures we have a single, connected client
export async function getRedisClient() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}
