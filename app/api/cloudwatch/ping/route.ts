// file: app/api/cloudwatch/ping/route.ts

import { NextResponse } from 'next/server';
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import logger from '@/utils/logger';

// Initialize the client
const client = new CloudWatchLogsClient({ region: process.env.AWS_REGION });


export async function GET() {
  const logGroupsStr = process.env.AWS_CLOUDWATCH_LOG_GROUPS;

  // We need at least one log group to test the connection against.
  if (!logGroupsStr) {
    const errorMessage = 'AWS_CLOUDWATCH_LOG_GROUPS env var not set for ping test.';
    logger.warn(errorMessage);
    return NextResponse.json({ connected: false, error: errorMessage }, { status: 400 });
  }

  // Use the first log group from the list for the test.
  const firstLogGroupName = logGroupsStr.split(',')[0].trim();

  try {
    // A simple, low-cost command to verify credentials and connectivity.
    const command = new DescribeLogGroupsCommand({
      logGroupNamePrefix: firstLogGroupName,
      limit: 1,
    });

    await client.send(command);
    
    // If the command succeeds without throwing an error, we are connected.
    logger.info(`AWS CloudWatch ping successful for log group prefix: ${firstLogGroupName}`);
    return NextResponse.json({ connected: true });

  } catch (error: any) {
    logger.error({ err: error }, 'AWS CloudWatch ping failed.');
    
    return NextResponse.json(
      { connected: false, error: error.message || 'Unknown AWS SDK error' },
      { status: 503 } // 503 Service Unavailable is appropriate here
    );
  }
}