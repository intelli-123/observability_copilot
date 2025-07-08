// file: app/api/gcp/ping/route.ts

import { NextResponse } from 'next/server';
import { Logging } from '@google-cloud/logging';
import logger from '@/utils/logger';
import { gcpProjectsConfig } from '@/config/gcp';

export async function GET() {
  if (gcpProjectsConfig.length === 0) {
    return NextResponse.json({ connected: false, error: 'No GCP projects configured.' }, { status: 400 });
  }

  // We only need to test the connection for the first configured project.
  const firstProject = gcpProjectsConfig[0];

  try {
    const logging = new Logging({
      projectId: firstProject.projectId,
      keyFilename: firstProject.keyFilename,
    });

    // A simple, low-cost command to verify credentials and connectivity.
    await logging.getEntries({ pageSize: 1 });
    
    logger.info(`GCP ping successful for project: ${firstProject.projectId}`);
    return NextResponse.json({ connected: true });

  } catch (error: any) {
    logger.error({ err: error }, `GCP ping failed for project: ${firstProject.projectId}`);
    return NextResponse.json(
      { connected: false, error: error.message || 'Unknown GCP SDK error' },
      { status: 503 }
    );
  }
}