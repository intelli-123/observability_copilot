// file: app/api/jenkins/log/route.ts

import { NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { getRedisClient } from '@/utils/redisClient'; // Import the shared client

const SETTINGS_KEY = 'app_tool_configurations';
const CACHE_KEY = 'cache:jenkins-logs';
const CACHE_EXPIRATION_SECONDS = 300; // 5 minutes

export async function GET() {
  try {
    const redis = await getRedisClient();

    // 1. Check for cached data first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      logger.info('Returning Jenkins logs from cache.');
      return NextResponse.json(JSON.parse(cachedData));
    }

    // 2. If no cache, fetch fresh data
    logger.info('Cache miss. Fetching fresh Jenkins logs.');
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) {
      throw new Error('Tool settings not found in the database.');
    }
    
    const settings: any = JSON.parse(settingsString);
    const jenkinsConfig = settings.configs?.jenkins;

    const jobNamesStr = jenkinsConfig?.JENKINS_JOB_NAMES || jenkinsConfig?.JENKINS_JOB_NAME;
    if (!jenkinsConfig?.JENKINS_BASE_URL || !jobNamesStr) {
        throw new Error('Jenkins URL or Job Names are not configured in settings.');
    }

    const jobNames = jobNamesStr.split(',').map((name: string) => name.trim()).filter((name: string) => name);
    const authHeader = `Basic ${btoa(`${jenkinsConfig.JENKINS_USER}:${jenkinsConfig.JENKINS_API_TOKEN}`)}`;

    const allBuildsPromises = jobNames.map(async (jobName: string) => {
      const encodedJobName = encodeURIComponent(jobName);
      const jenkinsUrl = `${jenkinsConfig.JENKINS_BASE_URL}/job/${encodedJobName}/api/json?tree=builds[number,url]`;
      
      const res = await fetch(jenkinsUrl, { headers: { 'Authorization': authHeader } });
      if (!res.ok) {
        logger.warn(`Failed to fetch builds for job: ${jobName}`);
        return [];
      }
      const data = await res.json();
      return data.builds || [];
    });

    const allBuildsNested = await Promise.all(allBuildsPromises);
    const allBuilds = allBuildsNested.flat();

    const logPromises = allBuilds.slice(0, 15).map(async (build: any) => {
      const logRes = await fetch(`${build.url}consoleText`, { headers: { 'Authorization': authHeader } });
      const logText = await logRes.text();
      return { build: build.number, log: logText };
    });

    const logs = await Promise.all(logPromises);
    const responsePayload = { logs };

    // 3. Save the fresh data to the cache with a 5-minute expiration
    await redis.set(CACHE_KEY, JSON.stringify(responsePayload), { EX: CACHE_EXPIRATION_SECONDS });
    logger.info('Saved fresh Jenkins logs to cache.');

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    logger.error({ err: error }, 'Error in Jenkins log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
