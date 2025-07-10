// file: app/api/settings/route.ts

import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import logger from '@/utils/logger';

// --- Redis Connection Setup ---
const redis = createClient({ url: process.env.REDIS_URL });

async function ensureRedisConnection() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
      logger.info('Successfully connected to Redis for settings route.');
    } catch (err) {
      logger.error({ err }, 'Failed to connect to Redis.');
      throw new Error('Database connection failed.');
    }
  }
}

const SETTINGS_KEY = 'app_tool_configurations';
// -----------------------------

// --- GET Handler: Load settings from Redis ---
export async function GET() {
  try {
    await ensureRedisConnection();
    const settingsString = await redis.get(SETTINGS_KEY);
    
    // DEBUG: Log the raw data we are loading from the database
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
    await ensureRedisConnection();
    const body = await request.json();
    
    // DEBUG: Log the data we are about to save
    logger.info({ settingsToSave: body }, 'Data received to save to Redis:');

    await redis.set(SETTINGS_KEY, JSON.stringify(body));
    
    logger.info('Successfully saved settings to Redis.');
    return NextResponse.json({ message: 'Settings saved successfully!' });

  } catch (error: any) {
    logger.error({ err: error }, 'Failed to save settings to Redis.');
    return NextResponse.json({ error: error.message || 'Could not save settings.' }, { status: 500 });
  }
}

