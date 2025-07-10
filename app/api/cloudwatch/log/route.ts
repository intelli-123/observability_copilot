// file: app/api/cloudwatch/log/route.ts

import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import { CloudWatchLogsClient, FilterLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
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
    if (!settingsString) throw new Error('CloudWatch settings not found.');

    const settings: any = JSON.parse(settingsString);
    const awsConfig = settings.configs?.cloudwatch;

    if (!awsConfig?.AWS_ACCESS_KEY_ID || !awsConfig?.AWS_SECRET_ACCESS_KEY || !awsConfig?.AWS_REGIONS_LOG_GROUPS) {
      throw new Error('AWS credentials or region/log group config is missing in settings.');
    }
    
    const regionConfigs = JSON.parse(awsConfig.AWS_REGIONS_LOG_GROUPS);

    const allLogPromises: Promise<any>[] = [];

    for (const config of regionConfigs) {
      const { region, logGroups } = config;
      if (!region || !logGroups || !Array.isArray(logGroups) || logGroups.length === 0) continue;

      const client = new CloudWatchLogsClient({
        region: region,
        credentials: {
          accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
          secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY,
        },
      });

      for (const logGroupName of logGroups) {
        const command = new FilterLogEventsCommand({
          logGroupName: logGroupName,
          limit: 50,
        });
        
        const promise = client.send(command).then(response => ({
          region,
          logGroupName,
          logs: response.events?.map(event => event.message).join('\n') || 'No recent logs found.',
        })).catch(err => {
            logger.error({err, region, logGroupName}, "Failed to fetch logs for a specific group");
            return { region, logGroupName, logs: `Error fetching logs: ${err.message}` };
        });

        allLogPromises.push(promise);
      }
    }

    const results = await Promise.all(allLogPromises);

    logger.info('Successfully processed CloudWatch log fetch requests.');
    return NextResponse.json({ logGroups: results });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in CloudWatch log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
