// pages/api/logs.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchLogsForTool } from '@/lib/logFetcher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  try {
    const { tool } = req.body;

    if (!tool) {
      return res.status(400).json({ error: 'Missing tool name in request body' });
    }

    const logs = await fetchLogsForTool(tool);
    return res.status(200).json(logs);
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
