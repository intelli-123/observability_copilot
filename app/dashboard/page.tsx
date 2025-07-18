// file: app/dashboard/page.tsx
import { createClient } from 'redis';
import { getVendorList } from '@/utils/envUtils';
import DashboardClient from './DashboardClient';

// This line tells Next.js to always render this page dynamically at request time.
export const dynamic = 'force-dynamic';

// This is an async Server Component
export default async function DashboardPage() {
  
  // 1. Fetch all settings from the database on the server
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();
  const settingsString = await redis.get('app_tool_configurations');
  await redis.disconnect();

  const settings: any = settingsString ? JSON.parse(settingsString as string) : { configs: {} };
  const savedConfigs = settings.configs || {};

  const allPossibleVendors = getVendorList();

  // 2. Map over all possible vendors to determine their status
  const vendorsToDisplay = allPossibleVendors
    .map((vendor) => {
      const isConfigured = !!savedConfigs[vendor.key];
      
      // If the tool is configured, we now assume it's connected.
      const rank = isConfigured ? 1 : 3; 

      return { ...vendor, rank };
    })
    // 3. Filter to only show tools that have been configured
    .filter(vendor => savedConfigs[vendor.key])
    .sort((a, b) => a.rank - b.rank);

  // 4. Pass the pre-fetched data to a Client Component for rendering
  return <DashboardClient vendors={vendorsToDisplay} />;
}
