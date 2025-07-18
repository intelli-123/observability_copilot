// file: app/api/settings/route.ts

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/utils/redisClient';
import logger from '@/utils/logger';

const SETTINGS_KEY = 'app_tool_configurations';

// --- GET Handler: Load settings from Redis ---
export async function GET() {
  try {
    const redis = await getRedisClient();
    const settingsString = await redis.get(SETTINGS_KEY);
    
    if (!settingsString) {
      return NextResponse.json({ configs: {} });
    }

    const settings = JSON.parse(settingsString);
    return NextResponse.json(settings);

  } catch (error: any) {
    logger.error({ err: error }, 'Failed to load settings from Redis.');
    return NextResponse.json({ error: error.message || 'Could not load settings.' }, { status: 500 });
  }
}

// --- POST Handler: Save settings and clear caches ---
export async function POST(request: Request) {
  try {
    const redis = await getRedisClient();
    const body = await request.json();
    
    // 1. Save the new settings
    await redis.set(SETTINGS_KEY, JSON.stringify(body));
    logger.info({ settingsToSave: body }, 'Successfully saved new settings to Redis.');

    // 2. Dynamically find all log cache keys using the KEYS command
    const logCacheKeys = await redis.keys('cache:*');

    // 3. If keys are found, delete them.
    if (logCacheKeys.length > 0) {
      logger.info({ keysToDelete: logCacheKeys }, 'Found stale log caches to clear.');
      await redis.del(logCacheKeys);
      logger.info('Successfully cleared stale log caches.');
    } else {
      logger.info('No log caches found to clear.');
    }
    
    return NextResponse.json({ message: 'Settings saved successfully!' });

  } catch (error: any) {
    logger.error({ err: error }, 'Failed to save settings to Redis.');
    return NextResponse.json({ error: error.message || 'Could not save settings.' }, { status: 500 });
  }
}
