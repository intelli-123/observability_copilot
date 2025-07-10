// file: app/dashboard/DashboardClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import ConsoleLogViewer from '@/components/ConsoleLogViewer';

// This component receives the pre-fetched vendor data as a prop
export default function DashboardClient({ vendors }: { vendors: any[] }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  // Helper functions for styling remain the same
  const border = (r: number) => (r === 1 ? 'border-green-400' : r === 2 ? 'border-orange-400' : 'border-red-400');
  const text = (r: number) => (r === 1 ? 'text-green-400' : r === 2 ? 'text-orange-400' : 'text-red-400');
  const label = (r: number) => (r === 1 ? 'Connected' : r === 2 ? 'Disconnected' : 'Disabled');

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <style jsx global>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .bob-animation { animation: bob 3s ease-in-out infinite; }
      `}</style>
      
      <aside className="w-64 hidden md:flex flex-col bg-gray-800 border-r border-gray-700 p-4 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Image
            src="/intell_logo_1.png"
            alt="Observability Copilot Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold">Observability Copilot</span>
        </div>
        
        <nav className="flex flex-col space-y-2 text-sm pt-4 flex-grow">
          <Link href="/dashboard" className="font-semibold text-white bg-indigo-600/30 px-3 py-2 rounded-md">
            Observability Tools
          </Link>
          <Link href="/settings" className="text-gray-400 hover:bg-gray-700/50 hover:text-white px-3 py-2 rounded-md transition-colors">
            Settings
          </Link>
        </nav>
        
        <button
          onClick={handleLogout}
          className="w-full text-sm flex items-center space-x-2 cursor-pointer text-gray-400 hover:bg-red-500/20 hover:text-red-400 px-3 py-2 rounded-md transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="flex-1 px-6 py-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Observability Status</h1>

        {vendors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {vendors.map((v) => (
              <Link href={v.link} key={v.name} className="group">
                <Card
                  className={clsx(
                    'relative transition-transform duration-300 hover:scale-[1.02] rounded-2xl p-4 shadow-md hover:shadow-lg',
                    border(v.rank), 'bg-gray-800', 'flex flex-col h-full'
                  )}
                >
                  <CardContent className="flex flex-col items-center space-y-2 flex-grow">
                    <div className="flex h-28 flex-col items-center justify-center space-y-2">
                      <div className="w-14 h-14 relative">
                        <Image src={v.logo} alt={v.name} fill className="object-contain" sizes="56px" />
                      </div>
                      <h2 className="text-sm font-semibold tracking-wide text-center">{v.name}</h2>
                      {v.badge && (
                        <span className="text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">{v.badge}</span>
                      )}
                    </div>
                    <div className="flex-grow"></div>
                    <Switch checked={v.rank === 1} disabled className="scale-90" />
                    <span className={clsx('text-xs font-medium uppercase tracking-wide', text(v.rank))}>{label(v.rank)}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No tools configured yet.</p>
            <Link href="/settings" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
              Go to Settings to add a tool.
            </Link>
          </div>
        )}
      </main>
      
      <div className="group fixed bottom-6 right-6 z-50">
        <div className="relative flex items-center">
          <div className="absolute right-full mr-4 whitespace-nowrap bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Click on a log card and ask questions
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
          </div>
          <div className="w-16 h-16 rounded-full shadow-2xl bob-animation">
            <Image
              src="/chatbot.avif"
              alt="Chatbot"
              width={64}
              height={64}
              className="rounded-full object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
      
      <ConsoleLogViewer />
    </div>
  );
}
