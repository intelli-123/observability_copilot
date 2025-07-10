// file: app/logs/cloudwatch/page.tsx
'use client';

import { useEffect, useState } from 'react';
import GeminiChatWidget from '@/components/GeminiChatWidget';
import LogPageTemplate from '@/components/LogPageTemplate';

type LogGroupData = {
  region: string;
  logGroupName: string;
  logs: string;
};

export default function AwsLogsPage() {
  const [logGroups, setLogGroups] = useState<LogGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    async function fetchAwsLogs() {
      try {
        const response = await fetch('/api/cloudwatch/log');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch logs');
        }
        setLogGroups(data.logGroups || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAwsLogs();
    
    return () => document.documentElement.classList.remove('dark');
  }, []);

  const combinedLogsForGemini = logGroups
    .map(lg => `--- Logs for ${lg.logGroupName} (Region: ${lg.region}) ---\n${lg.logs}`)
    .join('\n\n');

  return (
    <LogPageTemplate
      title="AWS CloudWatch Logs"
      iconSrc="/logos/cloudwatch.png"
      iconAlt="AWS CloudWatch Logo"
    >
      <div className="space-y-6">
        {loading && <p className="text-center py-10 text-gray-400">Loading AWS logs…</p>}
        {error && <p className="text-center py-10 text-red-400">Error: {error}</p>}
        
        {!loading && !error && logGroups.map((group) => (
          <section key={`${group.region}-${group.logGroupName}`} className="rounded-md border border-gray-700 bg-gray-800 shadow-sm">
            <header className="p-3 text-lg font-semibold text-amber-400 border-b border-gray-700 break-all">
              <span className="text-gray-400 text-sm block">Region: {group.region}</span>
              Log Group: {group.logGroupName}
            </header>
            
            <div className="p-3">
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-[60vh] bg-gray-950 p-3 rounded-md text-gray-300">
                {group.logs}
              </pre>
            </div>
          </section>
        ))}

        {!loading && !error && logGroups.length === 0 && (
            <p className="text-center py-10 text-gray-400">No logs found for the configured groups.</p>
        )}
      </div>

      <GeminiChatWidget logs={combinedLogsForGemini} />
    </LogPageTemplate>
  );
}
