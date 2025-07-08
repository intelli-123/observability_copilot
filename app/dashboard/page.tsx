// file: app/dashboard/page.tsx
'use client';
//throw new Error('✅ FIXED! The server is now running the new code.');

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, LogOut } from 'lucide-react';
import clsx from 'clsx';
import GeminiChatWidget from '@/components/GeminiChatWidget';
import { getVendorList } from '@/utils/envUtils';
import ConsoleLogViewer from '@/components/ConsoleLogViewer';

const vendorList = getVendorList();

type ConnectivityMap = Record<string, boolean>;

export default function DashboardPage() {
  
  const [connectivity, setConnectivity] = useState<ConnectivityMap>({});
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectivity = async () => {
      const results: ConnectivityMap = {};
      await Promise.all(
        vendorList.map(async (v) => {
          if (!v.env) return;
          try {
            const r = await fetch(v.ping);
            if (!r.ok) {
              results[v.name] = false;
              return;
            }
            const d = await r.json();
            results[v.name] = d.connected === true;
          } catch (error) {
            console.error(`Ping failed for ${v.name}:`, error);
            results[v.name] = false;
          }
        })
      );
      setConnectivity(results);
    };

    fetchConnectivity();
  }, []);

  const vendors = useMemo(() => {
    return vendorList
      .map((v) => {
        const envEnabled = Boolean(v.env);
        const isConnected = connectivity[v.name] ?? false;
        const rank = !envEnabled ? 3 : isConnected ? 1 : 2;
        return { ...v, envEnabled, isConnected, rank };
      })
      .sort((a, b) => a.rank - b.rank);
  }, [vendorList, connectivity]);

  const border = (r: number) => (r === 1 ? 'border-green-400' : r === 2 ? 'border-orange-400' : 'border-red-400');
  const text = (r: number) => (r === 1 ? 'text-green-400' : r === 2 ? 'text-orange-400' : 'text-red-400');
  const label = (r: number) => (r === 1 ? 'Connected' : r === 2 ? 'Enabled' : 'Disabled');

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <aside className="w-64 hidden md:flex flex-col bg-gray-800 border-r border-gray-700 p-4 space-y-6">
        <div className="text-2xl font-bold flex items-center space-x-2">
          <LayoutDashboard size={24} />
          <span>Dashboard</span>
        </div>
        <nav className="flex flex-col space-y-2 text-sm">
          <Link href="/dashboard" className="hover:text-indigo-400">
            Observability Tools
          </Link>
          <Link href="/settings" className="hover:text-indigo-400">
            Settings
          </Link>
        </nav>
        {/* <div className="mt-auto text-sm flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-red-500">
          <LogOut size={16} />
          <span>Logout</span>
        </div> */}
      </aside>

      <main className="flex-1 px-4 py-6">
        <h1 className="text-3xl font-semibold tracking-tight mb-6">Observability Status</h1>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {vendors.map((v) => (
            <div key={v.name} onClick={() => setSelectedVendor(v.name)} className="cursor-pointer group">
              <Link href={v.link}>
                <Card
                  className={clsx(
                    'relative transition-transform duration-300 hover:scale-[1.02] rounded-2xl p-4 shadow-md hover:shadow-lg',
                    border(v.rank),
                    'bg-gray-800',
                    'flex flex-col h-full' // 👈 ensures all cards have the same height
                  )}
                >
                  <CardContent className="flex flex-col items-center space-y-4 flex-grow">
                    <div className="flex h-28 flex-col items-center justify-center space-y-2">
                      <div className="w-14 h-14 relative">
                        <Image src={v.logo} alt={v.name} fill className="object-contain" />
                      </div>
                      <h2 className="text-sm font-semibold tracking-wide text-center">{v.name}</h2>
                      {'badge' in v && v.badge && (
                        <span className="text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                          {v.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex-grow"></div> {/* This spacer pushes the items below it to the bottom */}
                    
                    <Switch checked={v.rank === 1} disabled className="scale-90" />
                    <span className={clsx('text-xs font-medium uppercase tracking-wide', text(v.rank))}>
                      {label(v.rank)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* <GeminiChatWidget
        logs={selectedVendor ? `${selectedVendor}: paste or ask for log help.` : 'Select a tool first.'}
        enableDropdown={false}
      /> */}
       <ConsoleLogViewer />
    </div>
  );
}



// // file: app/dashboard/page.tsx
// 'use client';


// import Image from 'next/image';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { Switch } from '@/components/ui/switch';
// import { Card, CardContent } from '@/components/ui/card';
// import { LayoutDashboard, LogOut } from 'lucide-react';
// import clsx from 'clsx';
// import GeminiChatWidget from '@/components/GeminiChatWidget';
// import { getVendorList } from '@/utils/envUtils';


// type ConnectivityMap = Record<string, boolean>;

// export default function DashboardPage() {
//   const vendorList = getVendorList(); 

//   const [connectivity, setConnectivity] = useState<ConnectivityMap>({});
//   const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

//   /* ping on mount */
//   useEffect(() => {
//     (async () => {
//       const results: ConnectivityMap = {};
//       await Promise.all(
//         vendorList.map(async (v) => {
//           if (!v.env) return;
//           try {
//             const r = await fetch(v.ping);
//             const d = await r.json();
//             results[v.name] = d.connected === true;
//           } catch {
//             results[v.name] = false;
//           }
//         })
//       );
//       setConnectivity(results);
//     })();
//   }, [vendorList]); // Add vendorList as a dependency

//   /* build list with rank */
//   const vendors = vendorList
//     .map((v) => {
//       const envEnabled = Boolean(v.env);
//       const isConnected = connectivity[v.name] ?? false;
//       const rank = !envEnabled ? 3 : isConnected ? 1 : 2; // 1 green, 2 orange, 3 red
//       return { ...v, envEnabled, isConnected, rank };
//     })
//     .sort((a, b) => a.rank - b.rank);

//   const border = (r: number) => (r === 1 ? 'border-green-400' : r === 2 ? 'border-orange-400' : 'border-red-400');
//   const bar    = (r: number) => (r === 1 ? '#34D399' : r === 2 ? '#FBBF24' : '#F87171');
//   const text   = (r: number) => (r === 1 ? 'text-green-400' : r === 2 ? 'text-orange-400' : 'text-red-400');
//   const label  = (r: number) => (r === 1 ? 'Connected' : r === 2 ? 'Enabled' : 'Disabled');

//   return (
//     <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
//       {/* ── Sidebar ─────────────────────────────── */}
//       <aside className="w-64 hidden md:flex flex-col bg-gray-800 border-r border-gray-700 p-4 space-y-6">
//         <div className="text-2xl font-bold flex items-center space-x-2"><LayoutDashboard size={24} /><span>Dashboard</span></div>
//         <nav className="flex flex-col space-y-2 text-sm">
//           <Link href="/dashboard" className="hover:text-indigo-400">Observability Tools</Link>
//           <Link href="/settings"  className="hover:text-indigo-400">Settings</Link>
//         </nav>
//         <div className="mt-auto text-sm flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-red-500"><LogOut size={16}/><span>Logout</span></div>
//       </aside>

//       {/* ── Main ─────────────────────────────────── */}
//       <div className="flex-1 px-4 py-6">
//         <h1 className="text-3xl font-semibold tracking-tight mb-6">Observability Status</h1>

//         {/* cards */}
//         <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//           {vendors.map((v) => (
//             <div key={v.name} onClick={() => setSelectedVendor(v.name)} className="cursor-pointer group">
//               <Link href={v.link}>
//                 <Card className={clsx('relative transition-transform duration-300 hover:scale-[1.02] rounded-2xl p-4 shadow-md hover:shadow-lg', border(v.rank), 'bg-gray-800')}>
//                   <CardContent className="flex flex-col items-center space-y-4">
//                     <div className="w-14 h-14 relative"><Image src={v.logo} alt={v.name} fill className="object-contain"/></div>
//                     <h2 className="text-sm font-semibold tracking-wide text-center">{v.name}</h2>
//                     {'badge' in v && v.badge && (<span className="text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">{v.badge}</span>)}
//                     <Switch checked={v.rank === 1} disabled className="scale-90"/>
//                     <span className={clsx('text-xs font-medium uppercase tracking-wide', text(v.rank))}>{label(v.rank)}</span>
//                   </CardContent>
//                   <div className="absolute bottom-0 left-0 w-full h-1 rounded-b-2xl" style={{ backgroundColor: bar(v.rank) }}/>
//                 </Card>
//               </Link>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Gemini widget ───────────────────────── */}
//       <GeminiChatWidget
//         logs={selectedVendor ? `${selectedVendor}: paste or ask for log help.` : 'Select a tool first.'}
//         enableDropdown={false}
//       />
//     </div>
//   );
// }

