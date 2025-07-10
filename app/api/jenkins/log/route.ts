// file: app/api/jenkins/log/route.ts

import { NextResponse } from 'next/server';
import { createClient } from 'redis';
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

    logger.info({ jobs: jobNames.length, builds: logs.length }, 'Successfully fetched Jenkins logs using settings from Redis.');
    return NextResponse.json({ logs });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in Jenkins log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
