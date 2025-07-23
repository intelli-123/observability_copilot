// file: app/logs/gcp/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import GeminiChatWidget from '@/components/GeminiChatWidget';
import LogPageTemplate from '@/components/LogPageTemplate';

type GcpProjectLogs = {
  projectId: string;
  logs: string;
};

export default function GcpLogsPage() {
  const [projectLogs, setProjectLogs] = useState<GcpProjectLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // We wrap the fetch logic in useCallback so it can be called by useEffect and the refresh button
  const fetchGcpLogs = useCallback(async () => {
    // For a manual refresh, we want to bypass the browser's cache
    const cacheBuster = isRefreshing ? `?cacheBust=${new Date().getTime()}` : '';
    
    try {
      const response = await fetch(`/api/gcp/log${cacheBuster}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logs');
      }
      setProjectLogs(data.projectLogs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]); // Dependency ensures we get the correct cacheBuster value

  // Initial load
  useEffect(() => {
    fetchGcpLogs();
  }, []); // Runs only once on initial load

  // Manual refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setLoading(true); // Show the main loading indicator as well
    setError(null);
    // The useEffect dependency on isRefreshing will trigger the fetch
  };

  useEffect(() => {
    if (isRefreshing) {
      fetchGcpLogs();
    }
  }, [isRefreshing, fetchGcpLogs]);


  const combinedLogsForGemini = projectLogs
    .map(p => `--- Logs for GCP Project: ${p.projectId} ---\n${p.logs}`)
    .join('\n\n');

  return (
    <LogPageTemplate
      title="GCP Logs"
      iconSrc="/logos/gcp_logging.png"
      iconAlt="GCP Logs Logo"
      description="Review recent logs from your configured GCP projects."
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-6">
        {loading && <p className="text-center py-10 text-gray-400">Loading GCP logs…</p>}
        {error && <p className="text-center py-10 text-red-400">Error: {error}</p>}
        
        {!loading && !error && projectLogs.map((project) => (
          <section key={project.projectId} className="rounded-md border border-gray-700 bg-gray-800 shadow-sm">
            <header className="p-3 text-lg font-semibold text-amber-400 border-b border-gray-700">
              Project ID: {project.projectId}
            </header>
            <div className="p-3">
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-[60vh] bg-gray-950 p-3 rounded-md text-gray-300">
                {project.logs}
              </pre>
            </div>
          </section>
        ))}
        
        {!loading && !error && projectLogs.length === 0 && (
          <p className="text-center py-10 text-gray-400">No logs found for the configured projects.</p>
        )}
      </div>

      <GeminiChatWidget logs={combinedLogsForGemini} />
    </LogPageTemplate>
  );
}
