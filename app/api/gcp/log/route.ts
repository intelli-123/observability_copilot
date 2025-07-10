// file: app/api/gcp/log/route.ts

// file: app/api/gcp/log/route.ts

import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import { Logging } from '@google-cloud/logging';
import logger from '@/utils/logger';

const redis = createClient({ url: process.env.REDIS_URL });

async function ensureRedisConnection() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (err) {
      logger.error({ err }, 'Failed to connect to Redis.');
      throw new Error('Database connection failed.');
    }
  }
}

const SETTINGS_KEY = 'app_tool_configurations';

export async function GET() {
  try {
    await ensureRedisConnection();
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) throw new Error('GCP settings not found.');

    const settings: any = JSON.parse(settingsString);
    const gcpKeys = settings.configs?.gcp?.GCP_PROJECT_KEYS_JSON;

    if (!gcpKeys || !Array.isArray(gcpKeys) || gcpKeys.length === 0) {
      throw new Error('GCP project keys are not configured in settings.');
    }

    const promises = gcpKeys.map(async (keyJson: string) => {
      try {
        const credentials = JSON.parse(keyJson);
        const projectId = credentials.project_id;

        const logging = new Logging({ projectId, credentials });

        const filter = `timestamp>="${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}" AND logName !~ "cloudaudit.googleapis.com"`;
        
        const [entries] = await logging.getEntries({ filter, pageSize: 50, orderBy: 'timestamp desc' });
        
        logger.info({ project: projectId, count: entries.length }, "Found log entries for project.");

        const logs = entries.map(entry => {
          const metadata = entry.metadata;
          let timestamp = new Date(metadata.timestamp as any).toISOString();
          const severity = metadata.severity ?? 'DEFAULT';
          let message = typeof entry.data === 'object' ? JSON.stringify(entry.data, null, 2) : String(entry.data);
          return `${timestamp} | ${severity} | ${message.trim()}`;
        }).join('\n');

        return { projectId, logs: logs || 'No recent logs found.' };
      } catch (err: any) {
        logger.error({ err, partialKey: keyJson.slice(0, 50) }, `Failed to process a GCP key.`);
        return { projectId: `Error processing a key`, logs: err.message };
      }
    });

    const results = await Promise.all(promises);
    return NextResponse.json({ projectLogs: results });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in GCP log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
