// file: app/api/cloudwatch/log/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
  type FilterLogEventsCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs';
import logger from '@/utils/logger';
import { getRedisClient } from '@/utils/redisClient';

const SETTINGS_KEY = 'app_tool_configurations';
const CACHE_KEY = 'cache:cloudwatch-logs';
const CACHE_EXPIRATION_SECONDS = 300;
const MAX_EVENTS = 1500;

function formatUTCDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date) + ' UTC';
}

export async function GET(request: NextRequest) {
  try {
    const redis = await getRedisClient();
    const cacheBust = request.nextUrl.searchParams.get('cacheBust');

    if (!cacheBust) {
      const cachedData = await redis.get(CACHE_KEY);
      if (cachedData) {
        logger.info('Returning CloudWatch logs from cache.');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }

    logger.info('Cache miss or refresh requested. Fetching fresh CloudWatch logs.');
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) throw new Error('CloudWatch settings not found.');

    const settings: any = JSON.parse(settingsString);
    const awsConfig = settings.configs?.cloudwatch;

    if (
      !awsConfig?.AWS_ACCESS_KEY_ID ||
      !awsConfig?.AWS_SECRET_ACCESS_KEY ||
      !awsConfig?.AWS_REGIONS_LOG_GROUPS
    ) {
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
        const promise = (async () => {
          try {
            logger.info(`Fetching logs for ${logGroupName} in region ${region}`);

            const now = Date.now();
            const startTime = now - 2 * 24 * 60 * 60 * 1000; // last 72 hours

            const allEvents: any[] = [];
            let nextToken: string | undefined = undefined;

            while (true) {
              const command = new FilterLogEventsCommand({
                logGroupName,
                startTime,
                interleaved: true,
                nextToken,
                limit: 500,
              });

              const response = await client.send(command) as FilterLogEventsCommandOutput;

              if (response.events) {
                allEvents.push(...response.events);
              }

              if (response.nextToken && allEvents.length < MAX_EVENTS) {
                nextToken = response.nextToken;
              } else {
                break;
              }
            }

            const sortedEvents = allEvents.sort(
              (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)
            );

            const logs =
              sortedEvents.length > 0
                ? sortedEvents
                    .map((event) => event.message?.trim() || '')
                    .filter((msg) => msg.length > 0)
                    .join('\n')
                : `No logs found from ${formatUTCDate(new Date(startTime))} to ${formatUTCDate(new Date(now))}.`;

            return { region, logGroupName, logs };
          } catch (err: any) {
            logger.error({ err, region, logGroupName }, 'Failed to fetch logs for a specific group');
            return { region, logGroupName, logs: `Error fetching logs: ${err.message}` };
          }
        })();

        allLogPromises.push(promise);
      }
    }

    const results = await Promise.all(allLogPromises);
    const responsePayload = { logGroups: results };

    await redis.set(CACHE_KEY, JSON.stringify(responsePayload), {
      EX: CACHE_EXPIRATION_SECONDS,
    });

    logger.info('Saved fresh CloudWatch logs to cache.');

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    logger.error({ err: error }, 'Error in CloudWatch log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
