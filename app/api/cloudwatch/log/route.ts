// file: app/api/cloudwatch/log/route.ts

import { NextResponse } from 'next/server';
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import logger from '@/utils/logger';

// Initialize the client once
const client = new CloudWatchLogsClient({ region: process.env.AWS_REGION });

export async function GET() {
  // Read the comma-separated string from environment variables
  const logGroupNamesStr = process.env.AWS_CLOUDWATCH_LOG_GROUPS;

  if (!logGroupNamesStr) {
    const errorMessage = 'AWS_CLOUDWATCH_LOG_GROUPS environment variable is not set.';
    logger.error(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  

  // Split the string into an array of log group names
  //const logGroupNames = logGroupNamesStr.split(',').map(name => name.trim());
  const logGroupNames = logGroupNamesStr
    .split(',')
    .map(name => name.trim())
    .filter(name => name); // This will remove empty strings

  logger.info({ logGroupNames }, 'Fetching logs for specified CloudWatch log groups.');

  try {
    // Create a fetch promise for each log group
    const promises = logGroupNames.map(logGroupName => {
      const command = new FilterLogEventsCommand({
        logGroupName: logGroupName,
        limit: 50, // Get the 50 most recent events per group
      });
      return client.send(command).then(response => ({
        logGroupName,
        logs: response.events?.map(event => event.message).join('\n') || 'No recent logs found.',
      }));
    });

    // Wait for all fetches to complete
    const results = await Promise.all(promises);

    // Return an array of objects, each containing the logs for one group
    return NextResponse.json({ logGroups: results });

  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch logs from AWS CloudWatch.');
    return NextResponse.json(
      { error: 'Failed to fetch logs from AWS CloudWatch. Check server logs for details.' },
      { status: 500 }
    );
  }
}