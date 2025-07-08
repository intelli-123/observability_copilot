// file: app/api/gcp/log/route.ts

import { NextResponse } from 'next/server';
import { Logging } from '@google-cloud/logging';
import logger from '@/utils/logger';
import { gcpProjectsConfig } from '@/config/gcp';

export async function GET() {
  if (gcpProjectsConfig.length === 0) {
    logger.warn('GCP log endpoint called, but no projects are configured.');
    return NextResponse.json({ error: 'No GCP projects are configured.' }, { status: 500 });
  }

  logger.info({ projects: gcpProjectsConfig.map(p => p.projectId) }, 'Fetching logs for configured GCP projects.');

  try {
    const promises = gcpProjectsConfig.map(async (config) => {
      const logging = new Logging({
        projectId: config.projectId,
        keyFilename: config.keyFilename,
      });

      // 👇 This is the new, more reliable filter
      const filter = `
        timestamp>="${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}"
        AND
        logName !~ "cloudaudit.googleapis.com"
      `;

      const [entries] = await logging.getEntries({
        filter,
        pageSize: 1000,
        orderBy: 'timestamp desc',
      });

      logger.info({ project: config.projectId, count: entries.length }, "Found log entries for project.");

      const logs = entries.map(entry => {
        const metadata = entry.metadata;
        let timestamp = 'NO_TIMESTAMP';
        try {
          if (metadata?.timestamp) {
            timestamp = new Date(metadata.timestamp as any).toISOString();
          }
        } catch (e) {
          logger.warn({ timestamp: metadata?.timestamp }, "Could not parse invalid timestamp");
        }
        const severity = metadata?.severity ?? 'DEFAULT';
        let message = '[no message content]';
        if (entry.data) {
          message = typeof entry.data === 'object' ? JSON.stringify(entry.data, null, 2) : String(entry.data);
        }
        return `${timestamp} | ${severity} | ${message.trim()}`;
      }).join('\n');

      return {
        projectId: config.projectId,
        logs: logs || 'No recent logs found.',
      };
    });

    const results = await Promise.all(promises);
    return NextResponse.json({ projectLogs: results });

  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch logs from GCP Cloud Logging.');
    return NextResponse.json(
      { error: 'Failed to fetch logs from GCP. Check server logs for details.' },
      { status: 500 }
    );
  }
}