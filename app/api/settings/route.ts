// file: app/api/settings/route.ts

import { NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { getRedisClient } from '@/utils/redisClient'; // Import the shared client

const SETTINGS_KEY = 'app_tool_configurations';

// --- GET Handler: Load settings from Redis ---
export async function GET() {
  try {
    // Get the connected Redis client from our utility
    const redis = await getRedisClient();
    const settingsString = await redis.get(SETTINGS_KEY);
    
    logger.info({ loadedSettings: settingsString }, 'Data loaded from Redis:');

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

// --- POST Handler: Save settings to Redis ---
export async function POST(request: Request) {
  try {
    // Get the connected Redis client from our utility
    const redis = await getRedisClient();
    const body = await request.json();
    
    logger.info({ settingsToSave: body }, 'Data received to save to Redis:');

    await redis.set(SETTINGS_KEY, JSON.stringify(body));
    
    logger.info('Successfully saved settings to Redis.');
    return NextResponse.json({ message: 'Settings saved successfully!' });

  } catch (error: any) {
    logger.error({ err: error }, 'Failed to save settings to Redis.');
    return NextResponse.json({ error: error.message || 'Could not save settings.' }, { status: 500 });
  }
}
