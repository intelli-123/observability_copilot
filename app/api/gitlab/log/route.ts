// file: app/api/gitlab/log/route.ts

import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import logger from '@/utils/logger';

const redis = createClient({ url: process.env.REDIS_URL });

async function ensureRedisConnection() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

const SETTINGS_KEY = 'app_tool_configurations';

export async function GET() {
  try {
    await ensureRedisConnection();
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) throw new Error('GitLab settings not found in database.');

    const settings: any = JSON.parse(settingsString);
    const gitlabConfig = settings.configs?.gitlab;

    if (!gitlabConfig?.GITLAB_API_TOKEN || !gitlabConfig?.GITLAB_PROJECT_IDS) {
      throw new Error('GitLab API Token or Project IDs are not configured in settings.');
    }

    const projectIds = gitlabConfig.GITLAB_PROJECT_IDS.split(',').map((id: string) => id.trim()).filter(Boolean);

    const promises = projectIds.map(async (projectId: string) => {
      try {
        const gitlabUrl = `https://gitlab.com/api/v4/projects/${projectId}/audit_events`;
        const response = await fetch(gitlabUrl, {
          headers: {
            'PRIVATE-TOKEN': gitlabConfig.GITLAB_API_TOKEN,
          },
        });

        if (!response.ok) {
          throw new Error(`GitLab API returned status ${response.status}`);
        }

        const events = await response.json();
        const logs = events.map((event: any) => {
          return `${new Date(event.created_at).toISOString()} | ${event.author_name} | ${event.details.action}: ${event.details.target_type} "${event.details.target_details}"`;
        }).join('\n');

        return { projectId, logs: logs || 'No recent audit events found.' };
      } catch (err: any) {
        logger.error({ err, projectId }, `Failed to fetch logs for GitLab project ${projectId}`);
        return { projectId, logs: `Error fetching logs: ${err.message}` };
      }
    });

    const results = await Promise.all(promises);
    logger.info('Successfully fetched GitLab audit events.');
    return NextResponse.json({ projectLogs: results });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in GitLab log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
