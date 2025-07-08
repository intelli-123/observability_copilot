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



// // file: app/logs/jenkins/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link'; // 👈 Import Link
// import { ArrowLeft } from 'lucide-react'; // 👈 Import Icon
// import GeminiChatWidget from '@/components/GeminiChatWidget';

// /* ─── types ───────────────────────────────────── */
// type BuildLog = { build: number; log: string };

// /* ---------- helper to build Gemini context ---------- */
// function makeContext(raw: BuildLog[]): string {
//   const sorted = [...raw].sort((a, b) => b.build - a.build);

//   const meta = sorted
//     .map(({ build, log }) => {
//       const status =
//         /Finished:\s+SUCCESS/i.test(log)
//           ? 'SUCCESS'
//           : /Finished:\s+FAILURE/i.test(log)
//           ? 'FAILURE'
//           : 'UNKNOWN';
//       return `#${build} ${status}`;
//     })
//     .join('\n');

//   const truncatedLogs = sorted
//     .map(({ build, log }) => `=== Build #${build} ===\n${log}`)
//     .join('\n\n')
//     .slice(0, 15_000);

//   return `Jenkins Build Logs Summary:
// Total Builds Provided: ${sorted.length}
// Build Statuses Overview:
// ${meta}

// ── Full Logs (newest first, truncated if very long) ──
// ${truncatedLogs}`;
// }
// /* ---------------------------------------------------- */

// export default function JenkinsLogPage() { // Renamed component for clarity
//   const [logs, setLogs] = useState<BuildLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     document.documentElement.classList.add('dark');
//     return () => {
//       document.documentElement.classList.remove('dark');
//     };
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const r = await fetch('/api/jenkins/log');
//         const j = await r.json();
//         if (!r.ok) throw new Error(j.error || 'Fetch failed with status: ' + r.status);
//         setLogs(j.logs ?? []);
//       } catch (e: any) {
//         setError(e.message || 'An unknown error occurred');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const contextForGemini = makeContext(logs);

//   const getStatusForDisplay = (logContent: string): { text: string; color: string } => {
//     if (/Finished:\s+SUCCESS/i.test(logContent)) return { text: 'SUCCESS', color: 'text-emerald-400' };
//     if (/Finished:\s+FAILURE/i.test(logContent)) return { text: 'FAILURE', color: 'text-red-400' };
//     return { text: 'UNKNOWN', color: 'text-yellow-400' };
//   };

//   return (
//     // Set consistent background like the CloudWatch page
//     <main className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
//       <div className="max-w-5xl mx-auto space-y-6">
        
//         {/* */}
//         <div className="mb-2">
//             <Link href="/dashboard" className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
//                 <ArrowLeft size={16} className="mr-2" />
//                 Back to Dashboard
//             </Link>
//         </div>

//         {/* Header with Jenkins logo */}
//         <header className="flex items-center gap-4">
//           <Image
//             src="/logos/jenkins.png"
//             alt="Jenkins Logo"
//             width={60}
//             height={60}
//             className="rounded-md"
//           />
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-bold text-blue-400">
//               Jenkins Build Logs
//             </h1>
//             <p className="mt-1 text-sm text-gray-400">
//               Review recent build outputs and analyze them with AI.
//             </p>
//           </div>
//         </header>

//         {/* Loading, Error, and Empty States */}
//         {loading && <p className="text-center py-10 text-gray-400">Loading Jenkins logs…</p>}
//         {error && <p className="text-center py-10 text-red-400">Error: {error}</p>}
//         {!loading && !error && logs.length === 0 && (
//           <p className="text-center py-10 text-gray-400">No logs available.</p>
//         )}

//         {/* Log Details Sections */}
//         {!loading && !error && logs.map(({ build, log }) => {
//           const buildStatus = getStatusForDisplay(log);
//           return (
//             <details
//               key={build}
//               className="border border-gray-700 rounded-lg bg-gray-800 shadow-lg overflow-hidden group"
//               open={build === logs[0]?.build} // Open the latest build by default
//             >
//               <summary className="p-4 cursor-pointer select-none flex justify-between items-center list-none group-open:border-b group-open:border-gray-700 hover:bg-gray-700/50 transition-colors">
//                 <div className="font-semibold text-lg text-amber-400">
//                   Build&nbsp;<span className="font-mono text-yellow-300">#{build}</span>
//                   <span className="ml-4 text-sm font-medium">
//                     Status: <span className={buildStatus.color}>{buildStatus.text}</span>
//                   </span>
//                 </div>
//                 <span className="text-gray-400 transition-transform transform group-open:rotate-90">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                   </svg>
//                 </span>
//               </summary>
//               <pre className="max-h-[30rem] overflow-y-auto overflow-x-auto whitespace-pre-wrap bg-gray-950 p-4 text-xs sm:text-sm text-gray-300">
//                 {log}
//               </pre>
//             </details>
//           );
//         })}
//       </div>
      
//       {!loading && !error && logs.length > 0 && <GeminiChatWidget logs={contextForGemini} />}
//     </main>
//   );
// }


// // app/logs/jenkins/page.tsx (or your specific path for the "Details View" version)
// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image'; // Import Next.js Image component
// import GeminiChatWidget from '@/components/GeminiChatWidget';

// /* ─── types ───────────────────────────────────── */
// type BuildLog = { build: number; log: string };

// /* ---------- helper to build Gemini context ---------- */
// function makeContext(raw: BuildLog[]): string {
//   const sorted = [...raw].sort((a, b) => b.build - a.build);

//   const meta = sorted
//     .map(({ build, log }) => {
//       const status =
//         /Finished:\s+SUCCESS/i.test(log)
//           ? 'SUCCESS'
//           : /Finished:\s+FAILURE/i.test(log)
//           ? 'FAILURE'
//           : 'UNKNOWN';
//       return `#${build} ${status}`;
//     })
//     .join('\n');

//   const truncatedLogs = sorted
//     .map(({ build, log }) => `=== Build #${build} ===\n${log}`)
//     .join('\n\n')
//     .slice(0, 15_000);

//   return `Jenkins Build Logs Summary:
// Total Builds Provided: ${sorted.length}
// Build Statuses Overview:
// ${meta}

// ── Full Logs (newest first, truncated if very long) ──
// ${truncatedLogs}`;
// }
// /* ---------------------------------------------------- */

// export default function JenkinsLogPageDetailsVersion() {
//   const [logs, setLogs] = useState<BuildLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     document.documentElement.classList.add('dark');
//     return () => {
//       document.documentElement.classList.remove('dark');
//     };
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const r = await fetch('/api/jenkins/log');
//         const j = await r.json();
//         if (!r.ok) throw new Error(j.error || 'Fetch failed with status: ' + r.status);
//         setLogs(j.logs ?? []);
//       } catch (e: any) {
//         setError(e.message || 'An unknown error occurred');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const contextForGemini = makeContext(logs);

//   const getStatusForDisplay = (logContent: string): { text: string; color: string } => {
//     if (/Finished:\s+SUCCESS/i.test(logContent)) return { text: 'SUCCESS', color: 'text-emerald-400 dark:text-emerald-500' };
//     if (/Finished:\s+FAILURE/i.test(logContent)) return { text: 'FAILURE', color: 'text-red-400 dark:text-red-500' };
//     return { text: 'UNKNOWN', color: 'text-yellow-400 dark:text-yellow-500' };
//   };

//   return (
//     <main className="min-h-screen bg-black text-gray-200 py-8 px-4 sm:px-6 lg:px-8 font-sans">
//       {/* Updated header with Jenkins logo, no rocket, italic subtitle */}
//       <header className="max-w-5xl mx-auto mb-10 flex items-center gap-4">
//         <Image
//           src="/logos/jenkins.png" // Assumes jenkins.png is in your /public directory
//           alt="Jenkins Logo"
//           width={68} // Specify width (e.g., 48px)
//           height={68} // Specify height (e.g., 48px)
//           className="rounded-md" // Optional: if your logo benefits from it
//         />
//         <div>
//           <h1 className="text-3xl sm:text-4xl font-bold italic text-blue-400 dark:text-blue-500">
//             Jenkins Build Logs
//           </h1>
//           <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic"> {/* Italic subtitle */}
//             Review recent build outputs and analyze them with AI.
//           </p>
//         </div>
//       </header>

//       <div className="max-w-5xl mx-auto space-y-6">
//         {loading && (
//           <div className="flex justify-center items-center py-10">
//             <p className="text-lg text-gray-400 dark:text-gray-500">Loading Jenkins logs…</p>
//           </div>
//         )}
//         {error && (
//           <div className="bg-red-800/30 border border-red-700 text-red-300 px-4 py-3 rounded-md" role="alert">
//             <strong className="font-bold">Error: </strong>
//             <span className="block sm:inline">{error}</span>
//           </div>
//         )}
//         {!loading && !error && logs.length === 0 && (
//           <div className="text-center py-10">
//             <p className="text-gray-400 dark:text-gray-500">No logs available at the moment.</p>
//           </div>
//         )}

//         {!loading && !error && logs.map(({ build, log }) => {
//           const buildStatus = getStatusForDisplay(log);
//           return (
//             <details
//               key={build}
//               className="border border-gray-700 dark:border-gray-800 rounded-lg bg-gray-900 dark:bg-slate-600 shadow-xl overflow-hidden group"
//               open={build === logs[0]?.build}
//             >
//               <summary className="p-4 cursor-pointer select-none flex justify-between items-center list-none group-open:border-b group-open:border-gray-700 dark:group-open:border-gray-800 hover:bg-gray-800 dark:hover:bg-slate-800 transition-colors">
//                 <div className="font-semibold text-lg text-amber-300 dark:text-amber-400">
//                   Build&nbsp;<span className="font-mono text-yellow-300 dark:text-yellow-400">#{build}</span>
//                   <span className="ml-3 text-sm font-medium">
//                     Status: <span className={buildStatus.color}>{buildStatus.text}</span>
//                   </span>
//                 </div>
//                 <span className="text-gray-400 dark:text-gray-500 transition-transform transform group-open:rotate-90">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                   </svg>
//                 </span>
//               </summary>

//               <pre className="max-h-[30rem] overflow-y-auto overflow-x-auto whitespace-pre-wrap bg-black p-4 sm:p-5 text-xs sm:text-sm text-gray-300 dark:text-gray-400">
//                 {log}
//               </pre>
//             </details>
//           );
//         })}
//       </div>

//       {!loading && !error && logs.length > 0 && <GeminiChatWidget logs={contextForGemini} />}
//     </main>
//   );
// }
