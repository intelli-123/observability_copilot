// file: app/logs/jenkins/page.tsx
'use client';

import { useEffect, useState } from 'react';
import GeminiChatWidget from '@/components/GeminiChatWidget';
import LogPageTemplate from '@/components/LogPageTemplate'; // 👈 Import the template

type BuildLog = { build: number; log: string };

function makeContext(raw: BuildLog[]): string {
    const sorted = [...raw].sort((a, b) => b.build - a.build);
    const meta = sorted.map(({ build, log }) => {
        const status = /Finished:\s+SUCCESS/i.test(log) ? 'SUCCESS' : /Finished:\s+FAILURE/i.test(log) ? 'FAILURE' : 'UNKNOWN';
        return `#${build} ${status}`;
    }).join('\n');
    const truncatedLogs = sorted.map(({ build, log }) => `=== Build #${build} ===\n${log}`).join('\n\n').slice(0, 15_000);
    return `Jenkins Build Logs Summary:\nTotal Builds Provided: ${sorted.length}\nBuild Statuses Overview:\n${meta}\n\n── Full Logs (newest first, truncated if very long) ──\n${truncatedLogs}`;
}

export default function JenkinsLogPage() {
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    (async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/jenkins/log');
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Fetch failed with status: ' + r.status);
        setLogs(j.logs ?? []);
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    })();
    return () => { document.documentElement.classList.remove('dark'); };
  }, []);

  const contextForGemini = makeContext(logs);
  const getStatusForDisplay = (logContent: string): { text: string; color: string } => {
    if (/Finished:\s+SUCCESS/i.test(logContent)) return { text: 'SUCCESS', color: 'text-emerald-400' };
    if (/Finished:\s+FAILURE/i.test(logContent)) return { text: 'FAILURE', color: 'text-red-400' };
    return { text: 'UNKNOWN', color: 'text-yellow-400' };
  };

  return (
    <LogPageTemplate
      title="Jenkins Build Logs"
      iconSrc="/logos/jenkins.png"
      iconAlt="Jenkins Logo"
    >
      {/* The content below is passed as 'children' to the template */}
      <div className="space-y-4">
        {loading && <p className="text-center py-10 text-gray-400">Loading Jenkins logs…</p>}
        {error && <p className="text-center py-10 text-red-400">Error: {error}</p>}
        
        {!loading && !error && logs.map(({ build, log }) => {
          const buildStatus = getStatusForDisplay(log);
          return (
            <details key={build} className="border border-gray-700 rounded-lg bg-gray-800 shadow-lg overflow-hidden group" open={build === logs[0]?.build}>
              <summary className="p-4 cursor-pointer select-none flex justify-between items-center list-none group-open:border-b group-open:border-gray-700 hover:bg-gray-700/50 transition-colors">
                <div className="font-semibold text-lg text-amber-400">
                  Build&nbsp;<span className="font-mono text-yellow-300">#{build}</span>
                  <span className="ml-4 text-sm font-medium">
                    Status: <span className={buildStatus.color}>{buildStatus.text}</span>
                  </span>
                </div>
                <span className="text-gray-400 transition-transform transform group-open:rotate-90">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </span>
              </summary>
              <pre className="max-h-[30rem] overflow-y-auto overflow-x-auto whitespace-pre-wrap bg-gray-950 p-4 text-xs sm:text-sm text-gray-300">{log}</pre>
            </details>
          );
        })}
      </div>

      {!loading && !error && logs.length > 0 && <GeminiChatWidget logs={contextForGemini} />}
    </LogPageTemplate>
  );
}


