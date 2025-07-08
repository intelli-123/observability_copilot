// file: config/gcp.ts

import logger from '@/utils/logger';

interface GcpProjectConfig {
  name: string;      // e.g., 'projectA'
  projectId: string;
  keyFilename: string;
}

const projects: GcpProjectConfig[] = [];

// Read the master list of project keys from the environment variable
const projectKeysStr = process.env.GCP_PROJECT_KEYS || '';
const projectKeys = projectKeysStr.split(',').map(p => p.trim()).filter(p => p);

// Dynamically build the configuration for each key
projectKeys.forEach(key => {
  const upperKey = key.toUpperCase();
  const projectId = process.env[`GCP_${upperKey}_ID`];
  const keyFilename = process.env[`GCP_${upperKey}_KEY_FILE`];

  if (projectId && keyFilename) {
    projects.push({
      name: key,
      projectId: projectId,
      keyFilename: keyFilename,
    });
  } else {
    logger.warn(`Skipping GCP project "${key}": Missing GCP_${upperKey}_ID or GCP_${upperKey}_KEY_FILE environment variables.`);
  }
});

export const gcpProjectsConfig = projects;