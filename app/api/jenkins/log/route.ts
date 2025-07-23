// file: app/api/jenkins/log/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/utils/redisClient';
import logger from '@/utils/logger';

const SETTINGS_KEY = 'app_tool_configurations';
const CACHE_KEY = 'cache:jenkins-logs';
const CACHE_EXPIRATION_SECONDS = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const redis = await getRedisClient();
    const cacheBust = request.nextUrl.searchParams.get('cacheBust');

    if (!cacheBust) {
      const cachedData = await redis.get(CACHE_KEY);
      if (cachedData) {
        logger.info('Returning Jenkins logs from cache.');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }

    logger.info('Cache miss or refresh requested. Fetching fresh Jenkins logs.');
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

    const jobNames = jobNamesStr.split(',').map((name: string) => name.trim()).filter(Boolean);
    const authHeader = `Basic ${btoa(`${jenkinsConfig.JENKINS_USER}:${jenkinsConfig.JENKINS_API_TOKEN}`)}`;

    // --- This is the new, more robust fetching logic ---
    const allLogPromises = jobNames.map(async (jobName: string) => {
      try {
        const encodedJobName = encodeURIComponent(jobName);
        const jenkinsUrl = `${jenkinsConfig.JENKINS_BASE_URL}/job/${encodedJobName}/api/json?tree=builds[number,url]`;
        
        const res = await fetch(jenkinsUrl, { headers: { 'Authorization': authHeader } });
        if (!res.ok) {
          throw new Error(`Failed to fetch builds for job: ${jobName} (Status: ${res.status})`);
        }
        const data = await res.json();
        const recentBuilds = (data.builds || []).slice(0, 10); // Get the 10 most recent builds for THIS job

        // Fetch the console log for each of this job's recent builds
        const logPromisesForJob = recentBuilds.map(async (build: any) => {
            const logRes = await fetch(`${build.url}consoleText`, { headers: { 'Authorization': authHeader } });
            const logText = await logRes.text();
            return { build: build.number, log: logText, jobName: jobName };
        });

        return Promise.all(logPromisesForJob);
      } catch (error) {
        logger.warn({ err: error, jobName }, `Could not fetch logs for job.`);
        return []; // Return an empty array on failure for this specific job
      }
    });

    const logsFromAllJobsNested = await Promise.all(allLogPromises);
    const logs = logsFromAllJobsNested.flat(); // Combine the logs from all jobs into a single list
    // ----------------------------------------------------

    const responsePayload = { logs };

    await redis.set(CACHE_KEY, JSON.stringify(responsePayload), { EX: CACHE_EXPIRATION_SECONDS });
    logger.info('Saved fresh Jenkins logs to cache.');

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    logger.error({ err: error }, 'Error in Jenkins log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
