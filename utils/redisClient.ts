// file: utils/redisClient.ts

import { createClient } from 'redis';
import logger from './logger';

// Create a single, persistent Redis client instance.
const redis = createClient({
  url: process.env.REDIS_URL,
});

// Add an error listener to log any connection issues.
redis.on('error', (err) => logger.error({ err }, 'Redis Client Error'));


export async function getRedisClient() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
      logger.info('Established new connection to Redis.');
    } catch (err) {
      logger.error({ err }, 'Failed to connect to Redis.');
      // Re-throw the error to be handled by the calling function
      throw new Error('Database connection failed.');
    }
  }
  return redis;
}
