// file: app/logs/cloudwatch/page.tsx
'use client';

import { useEffect, useState } from 'react';
import GeminiChatWidget from '@/components/GeminiChatWidget';
import LogPageTemplate from '@/components/LogPageTemplate'; // Import the template

// Define a type for the log group data structure
type LogGroupData = {
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
    .map(lg => `--- Logs for ${lg.logGroupName} ---\n${lg.logs}`)
    .join('\n\n');

  return (
    // 👇 Make sure you are passing all the required props here
    <LogPageTemplate
      title="AWS CloudWatch Logs"
      iconSrc="/logos/cloudwatch.png"
      iconAlt="AWS CloudWatch Logo"
    >
      {/* The content below is passed as 'children' to the template */}
      <div className="space-y-6">
        {loading && <p className="text-center py-10 text-gray-400">Loading AWS logs…</p>}
        {error && <p className="text-center py-10 text-red-400">Error: {error}</p>}
        
        {!loading && !error && logGroups.map((group) => (
          <section key={group.logGroupName} className="rounded-md border border-gray-700 bg-gray-800 shadow-sm">
            <header className="p-3 text-lg font-semibold text-amber-400 border-b border-gray-700 break-all">
              Log Group: {group.logGroupName}
            </header>
            <div className="p-3">
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-[60vh] bg-gray-950 p-3 rounded-md">
                {group.logs}
              </pre>
            </div>
          </section>
        ))}
      </div>

      <GeminiChatWidget logs={combinedLogsForGemini} />
    </LogPageTemplate>
  );
}