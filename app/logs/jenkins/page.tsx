// file: app/logs/jenkins/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import GeminiChatWidget from '@/components/GeminiChatWidget';
import LogPageTemplate from '@/components/LogPageTemplate';
import { ChevronRight } from 'lucide-react';

type BuildLog = { 
  build: number; 
  log: string; 
  jobName: string;
};

type GroupedLogs = {
  [jobName: string]: BuildLog[];
};

function makeContext(raw: BuildLog[]): string {
    const sorted = [...raw].sort((a, b) => b.build - a.build);
    const meta = sorted.map(({ build, log, jobName }) => {
        const status = /Finished:\s+SUCCESS/i.test(log) ? 'SUCCESS' : /Finished:\s+FAILURE/i.test(log) ? 'FAILURE' : 'UNKNOWN';
        return `Job: ${jobName}, Build #${build} ${status}`;
    }).join('\n');
    const truncatedLogs = sorted.map(({ build, log, jobName }) => `=== Job: ${jobName}, Build #${build} ===\n${log}`).join('\n\n').slice(0, 15_000);
    return `Jenkins Build Logs Summary:\nTotal Builds Provided: ${sorted.length}\nBuild Statuses Overview:\n${meta}\n\n── Full Logs (newest first, truncated if very long) ──\n${truncatedLogs}`;
}

export default function JenkinsLogPage() {
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJenkinsLogs = useCallback(async () => {
    const cacheBuster = isRefreshing ? `?cacheBust=${new Date().getTime()}` : '';
    try {
      const r = await fetch(`/api/jenkins/log${cacheBuster}`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Fetch failed with status: ' + r.status);
      setLogs(j.logs ?? []);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    fetchJenkinsLogs();
  }, []); // Initial load

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLoading(true);
    setError(null);
  };

  useEffect(() => {
    if (isRefreshing) {
      fetchJenkinsLogs();
    }
  }, [isRefreshing, fetchJenkinsLogs]);

  // --- New Grouping Logic ---
  const groupedLogs = useMemo(() => {
    return logs.reduce((acc, log) => {
      const jobName = log.jobName || 'Unknown Pipeline';
      if (!acc[jobName]) {
        acc[jobName] = [];
      }
      acc[jobName].push(log);
      acc[jobName].sort((a, b) => b.build - a.build);
      return acc;
    }, {} as GroupedLogs);
  }, [logs]);

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
      description="Review recent build outputs and analyze them with AI."
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
      <div className="space-y-6">
        {loading && <p className="text-center py-10 text-gray-400">Loading Jenkins logs…</p>}
        {error && <p className="text-center py-10 text-red-400">Error: {error}</p>}
        
        {/* --- New Rendering Logic for Grouped Logs --- */}
        {!loading && !error && Object.entries(groupedLogs).map(([jobName, builds]) => (
          <details key={jobName} className="border border-gray-700 rounded-lg bg-gray-800 shadow-lg overflow-hidden" open>
            <summary className="p-4 cursor-pointer select-none flex justify-between items-center list-none bg-gray-700/50 hover:bg-gray-700/80">
              <h2 className="font-bold text-xl text-white">{jobName}</h2>
              <span className="text-gray-400 text-sm">{builds.length} builds</span>
            </summary>
            
            <div className="p-4 space-y-2">
              {builds.map(({ build, log }) => {
                const buildStatus = getStatusForDisplay(log);
                return (
                  <details key={build} className="border border-gray-600 rounded-md bg-gray-900/50 overflow-hidden group">
                    <summary className="p-3 cursor-pointer select-none flex justify-between items-center list-none hover:bg-gray-700/50">
                      <div className="font-semibold text-md text-amber-400">
                        Build&nbsp;<span className="font-mono text-yellow-300">#{build}</span>
                        <span className="ml-4 text-sm font-medium">
                          Status: <span className={buildStatus.color}>{buildStatus.text}</span>
                        </span>
                      </div>
                      <ChevronRight className="text-gray-400 transition-transform transform group-open:rotate-90" />
                    </summary>
                    <pre className="max-h-[30rem] overflow-y-auto overflow-x-auto whitespace-pre-wrap bg-black p-4 text-xs text-gray-300 border-t border-gray-600">{log}</pre>
                  </details>
                );
              })}
            </div>
          </details>
        ))}

         {!loading && !error && logs.length === 0 && (
            <p className="text-center py-10 text-gray-400">No logs found for the configured jobs.</p>
        )}
      </div>

      {!loading && !error && logs.length > 0 && <GeminiChatWidget logs={contextForGemini} />}
    </LogPageTemplate>
  );
}


// 'use client';

// import { useEffect, useState, useCallback, useMemo } from 'react';
// import GeminiChatWidget from '@/components/GeminiChatWidget';
// import LogPageTemplate from '@/components/LogPageTemplate';
// import { ChevronRight } from 'lucide-react'; // Using a standard icon for consistency

// type BuildLog = { 
//   build: number; 
//   log: string; 
//   jobName: string;
// };

// // Group logs by their jobName
// type GroupedLogs = {
//   [jobName: string]: BuildLog[];
// };

// function makeContext(raw: BuildLog[]): string {
//     const sorted = [...raw].sort((a, b) => b.build - a.build);
//     const meta = sorted.map(({ build, log, jobName }) => {
//         const status = /Finished:\s+SUCCESS/i.test(log) ? 'SUCCESS' : /Finished:\s+FAILURE/i.test(log) ? 'FAILURE' : 'UNKNOWN';
//         return `Job: ${jobName}, Build #${build} ${status}`;
//     }).join('\n');
//     const truncatedLogs = sorted.map(({ build, log, jobName }) => `=== Job: ${jobName}, Build #${build} ===\n${log}`).join('\n\n').slice(0, 15_000);
//     return `Jenkins Build Logs Summary:\nTotal Builds Provided: ${sorted.length}\nBuild Statuses Overview:\n${meta}\n\n── Full Logs (newest first, truncated if very long) ──\n${truncatedLogs}`;
// }

// export default function JenkinsLogPage() {
//   const [logs, setLogs] = useState<BuildLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const fetchJenkinsLogs = useCallback(async () => {
//     const cacheBuster = isRefreshing ? `?cacheBust=${new Date().getTime()}` : '';
//     try {
//       const r = await fetch(`/api/jenkins/log${cacheBuster}`, { cache: 'no-store' });
//       const j = await r.json();
//       if (!r.ok) throw new Error(j.error || 'Fetch failed with status: ' + r.status);
//       setLogs(j.logs ?? []);
//     } catch (e: any) {
//       setError(e.message || 'An unknown error occurred');
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [isRefreshing]);

//   useEffect(() => {
//     fetchJenkinsLogs();
//   }, []); // Initial load

//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     setLoading(true);
//     setError(null);
//   };

//   useEffect(() => {
//     if (isRefreshing) {
//       fetchJenkinsLogs();
//     }
//   }, [isRefreshing, fetchJenkinsLogs]);

//   // --- Required Grouping Logic ---
//   const groupedLogs = useMemo(() => {
//     return logs.reduce((acc, log) => {
//       // Use jobName from the log or fallback
//       const jobName = log.jobName || 'Unknown Pipeline';
//       if (!acc[jobName]) {
//         acc[jobName] = [];
//       }
//       acc[jobName].push(log);
//       // Sort builds newest first within each pipeline
//       acc[jobName].sort((a, b) => b.build - a.build);
//       return acc;
//     }, {} as GroupedLogs);
//   }, [logs]);

//   const contextForGemini = makeContext(logs);
//   const getStatusForDisplay = (logContent: string): { text: string; color: string } => {
//     if (/Finished:\s+SUCCESS/i.test(logContent)) return { text: 'SUCCESS', color: 'text-emerald-400' };
//     if (/Finished:\s+FAILURE/i.test(logContent)) return { text: 'FAILURE', color: 'text-red-400' };
//     return { text: 'UNKNOWN', color: 'text-yellow-400' };
//   };

//   return (
//     <LogPageTemplate
//       title="Jenkins Build Logs"
//       iconSrc="/logos/jenkins.png"
//       iconAlt="Jenkins Logo"
//       description="Review recent build outputs and analyze them with AI."
//       onRefresh={handleRefresh}
//       isRefreshing={isRefreshing}
//     >
//       <div className="space-y-6">
//         {loading && <p className="text-center py-10 text-gray-400">Loading Jenkins logs…</p>}
//         {error && <p className="text-center py-10 text-red-400">Error: {error}</p>}
        
//         {/* --- Updated Rendering Logic for Grouped Logs --- */}
//         {!loading && !error && Object.entries(groupedLogs).map(([jobName, builds]) => (
//           <details key={jobName} className="border border-gray-700 rounded-lg bg-gray-800 shadow-lg overflow-hidden" open>
//             {/* Pipeline Group Header */}
//             <summary className="p-4 cursor-pointer select-none flex justify-between items-center list-none bg-gray-700/50 hover:bg-gray-700/80">
//               <h2 className="font-bold text-xl text-white">{jobName}</h2>
//               <span className="text-gray-400 text-sm">{builds.length} builds</span>
//             </summary>
            
//             {/* Individual Builds */}
//             <div className="p-4 space-y-2">
//               {builds.map(({ build, log }) => {
//                 const buildStatus = getStatusForDisplay(log);
//                 return (
//                   <details key={build} className="border border-gray-600 rounded-md bg-gray-900/50 overflow-hidden group">
//                     <summary className="p-3 cursor-pointer select-none flex justify-between items-center list-none hover:bg-gray-700/50">
//                       <div className="font-semibold text-md text-amber-400">
//                         {/* Show jobName here as well */}
//                         <span className="text-gray-400 text-xs block">{jobName}</span>
//                         Build&nbsp;<span className="font-mono text-yellow-300">#{build}</span>
//                         <span className="ml-4 text-sm font-medium">
//                           Status: <span className={buildStatus.color}>{buildStatus.text}</span>
//                         </span>
//                       </div>
//                       <ChevronRight className="text-gray-400 transition-transform transform group-open:rotate-90" />
//                     </summary>
//                     <pre className="max-h-[30rem] overflow-y-auto overflow-x-auto whitespace-pre-wrap bg-black p-4 text-xs text-gray-300 border-t border-gray-600">{log}</pre>
//                   </details>
//                 );
//               })}
//             </div>
//           </details>
//         ))}

//         {!loading && !error && logs.length === 0 && (
//           <p className="text-center py-10 text-gray-400">No logs found for the configured jobs.</p>
//         )}
//       </div>

//       {!loading && !error && logs.length > 0 && <GeminiChatWidget logs={contextForGemini} />}
//     </LogPageTemplate>
//   );
// }
