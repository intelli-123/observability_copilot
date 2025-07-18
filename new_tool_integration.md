# How to Add a New Log Integration

This document outlines the standard procedure for adding a new log source (e.g., Splunk, Datadog) to the **Observability Copilot** application. Following these steps will ensure the new tool is correctly integrated into the settings page, dashboard, and log viewing system.

We will use a hypothetical **Splunk** integration as an example.

---

## Step 1: Add the Tool to the Settings Configuration

This is the first and most important step. It makes the new tool appear on the main settings page, allowing users to configure its credentials.

- **File to Edit**: `constants/tools.ts`  
- **Why**: This file is the single source of truth for all configurable tools in the application. The settings UI is dynamically generated from this list.

**Action**:  
Add a new `ToolConfig` object to the `TOOL_CONFIGS` array. Define the `key` (a unique identifier), name, logo, and the specific fields required for its configuration.

**Example for Splunk**:

```ts
// file: constants/tools.ts

export const TOOL_CONFIGS: ToolConfig[] = [
  // ... (your existing tool configs for Jenkins, GCP, etc.)
  
  {
    key: 'splunk',
    name: 'Splunk',
    description: 'Configure your Splunk integration.',
    logo: '/logos/splunk.png', // Ensure splunk.png is in /public/logos
    fields: [
      { 
        key: 'SPLUNK_HEC_URL', 
        label: 'Splunk HEC URL', 
        placeholder: 'https://your-splunk-instance:8088' 
      },
      { 
        key: 'SPLUNK_HEC_TOKEN', 
        label: 'HEC Token', 
        placeholder: 'Enter your Splunk HEC token',
        type: 'password' 
      },
    ],
  },
];

```
---

## Step 2: Add the Tool to the Dashboard Vendor List
This step makes the card for your new tool appear on the main dashboard after it has been configured.

- **File to Edit**: `utils/envUtils.ts`

- **Why**: The dashboard page uses this central list to know which vendors are available in the application and how to display them.

**Action**:
Add a new object to the getVendorList array. The key must match the key you used in constants/tools.ts. The type should be 'log' for standard log viewers.

Example for Splunk:

```ts
// file: utils/envUtils.ts

export const getVendorList = () => {
  return [
    // ... (your existing vendors)
    
    {
      key: 'splunk',
      name: 'Splunk',
      logo: '/logos/splunk.png',
      link: '/logs/splunk',
      type: 'log', // This tells the dashboard to navigate to the log page on click
    },
  ] as const;
};
```
---
## Step 3: Create the Backend API Route
This is the server-side endpoint that will securely fetch the logs from the new tool using the credentials saved by the user.

- **File to Edit**: `app/api/splunk/log/route.ts` (The path splunk must match the key from Step 1).

- **Why**: This API acts as a secure proxy. It gets the credentials from our database (Vercel KV) and uses them to make the actual request to the tool's API. This prevents secrets from ever being exposed to the user's browser.

**Action**:
Create the new file and add the logic to fetch logs. You can use the code below as a template.

Example for Splunk:
``` ts
// file: app/api/splunk/log/route.ts

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/utils/redisClient';
import logger from '@/utils/logger';

const SETTINGS_KEY = 'app_tool_configurations';
const CACHE_KEY = 'cache:splunk-logs';
const CACHE_EXPIRATION_SECONDS = 300; // 5 minutes

export async function GET() {
  try {
    const redis = await getRedisClient();

    // 1. Check for cached data first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      logger.info('Returning Splunk logs from cache.');
      return NextResponse.json(JSON.parse(cachedData));
    }

    // 2. Fetch settings from Redis
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) throw new Error('Splunk settings not found.');

    const settings: any = JSON.parse(settingsString);
    const splunkConfig = settings.configs?.splunk;

    if (!splunkConfig?.SPLUNK_HEC_URL || !splunkConfig?.SPLUNK_HEC_TOKEN) {
      throw new Error('Splunk URL or Token is not configured.');
    }

    // 3. Fetch logs from the Splunk API (this is an example query)
    // You would replace this with the actual Splunk API call.
    const splunkResponse = await fetch(`${splunkConfig.SPLUNK_HEC_URL}/services/collector/raw`, {
      method: 'POST', // This is just an example
      headers: {
        'Authorization': `Splunk ${splunkConfig.SPLUNK_HEC_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'index=* | head 50' }),
    });

    if (!splunkResponse.ok) {
      throw new Error(`Splunk API returned status ${splunkResponse.status}`);
    }

    const logs = await splunkResponse.text(); // Or .json() depending on the API
    const responsePayload = { logs: logs || "No recent logs found." };

    // 4. Save the fresh data to the cache
    await redis.set(CACHE_KEY, JSON.stringify(responsePayload), { EX: CACHE_EXPIRATION_SECONDS });

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    logger.error({ err: error }, 'Error in Splunk log route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```
---
## Step 4: Create the Frontend Log Page
Finally, create the page that will display the logs to the user. Because we have a reusable template, this file is very simple.

- **File to Create**: `app/logs/splunk/page.tsx`

- **Why**: This creates the dedicated URL for viewing the new tool's logs. It uses our LogPageTemplate to ensure a consistent look and feel with all other log pages.

**Action**:
Create the new file and add the following code.

Example for Splunk:
``` ts
// file: app/logs/splunk/page.tsx
'use client';

import { useEffect, useState } from 'react';
import GeminiChatWidget from '@/components/GeminiChatWidget';
import LogPageTemplate from '@/components/LogPageTemplate';

export default function SplunkLogPage() {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    async function fetchSplunkLogs() {
      try {
        const response = await fetch('/api/splunk/log');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch logs');
        }
        setLogs(data.logs);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSplunkLogs();
    
    return () => document.documentElement.classList.remove('dark');
  }, []);

  return (
    <LogPageTemplate
      title="Splunk Logs"
      iconSrc="/logos/splunk.png"
      iconAlt="Splunk Logo"
    >
      <section className="rounded-md border border-gray-700 bg-gray-800 shadow-sm">
        <header className="p-3 text-lg font-semibold text-amber-400 border-b border-gray-700">
          Recent Log Events
        </header>
        <div className="p-3">
          {loading && <p className="text-sm text-gray-400">Loading Splunk logs…</p>}
          {error && <p className="text-sm text-red-400">Error: {error}</p>}
          {!loading && !error && (
            <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-[60vh] bg-gray-950 p-3 rounded-md text-gray-300">
              {logs}
            </pre>
          )}
        </div>
      </section>

      <GeminiChatWidget logs={logs} />
    </LogPageTemplate>
  );
}
```
By following these four steps, you can add any new log-based integration to the application in a clean, scalable, and maintainable way.