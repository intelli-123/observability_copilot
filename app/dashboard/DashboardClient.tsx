// file: app/dashboard/DashboardClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import ConsoleLogViewer from '@/components/ConsoleLogViewer';
import LogChatModal from '@/components/LogChatModal';

export default function DashboardClient({ vendors }: { vendors: any[] }) {
  const router = useRouter();
  const [chatVendor, setChatVendor] = useState<any | null>(null);

  const handleLogout = () => {
    router.push('/');
  };

  const border = (r: number) => (r === 1 ? 'border-green-400' : 'border-red-400');
  const text = (r: number) => (r === 1 ? 'text-green-400' : 'text-red-400');
  const label = (r: number) => (r === 1 ? 'Connected' : 'Disabled');

  // A reusable Card component to avoid duplication
  const VendorCard = ({ vendor }: { vendor: any }) => (
    <Card
      className={clsx(
        'relative transition-transform duration-300 hover:scale-[1.02] rounded-2xl p-4 shadow-md hover:shadow-lg',
        border(vendor.rank), 'bg-gray-800', 'flex flex-col h-full'
      )}
    >
      <CardContent className="flex flex-col items-center space-y-2 flex-grow">
        <div className="flex h-28 flex-col items-center justify-center space-y-2">
          <div className="w-14 h-14 relative">
            <Image src={vendor.logo} alt={vendor.name} fill className="object-contain" sizes="56px" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide text-center">{vendor.name}</h2>
          {vendor.badge && (
            <span className="text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">{vendor.badge}</span>
          )}
        </div>
        <div className="flex-grow"></div>
        <Switch checked={vendor.rank === 1} disabled className="scale-90" />
        <span className={clsx('text-xs font-medium uppercase tracking-wide', text(vendor.rank))}>{label(vendor.rank)}</span>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      <aside className="w-64 hidden md:flex flex-col bg-gray-800 border-r border-gray-700 p-4 space-y-6">
        {/* ... Sidebar content remains the same ... */}
        <div className="flex items-center gap-3 px-2">
          <Image src="/intell_logo_1.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <span className="text-xl font-bold">Observability Copilot</span>
        </div>
        <nav className="flex flex-col space-y-2 text-sm pt-4 flex-grow">
          <Link href="/dashboard" className="font-semibold text-white bg-indigo-600/30 px-3 py-2 rounded-md">Observability Tools</Link>
          <Link href="/settings" className="text-gray-400 hover:bg-gray-700/50 hover:text-white px-3 py-2 rounded-md">Settings</Link>
        </nav>
        <button onClick={handleLogout} className="w-full text-sm flex items-center space-x-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 px-3 py-2 rounded-md">
          <LogOut size={16} /><span>Logout</span>
        </button>
      </aside>

      <main className="flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Observability Status</h1>
          <p className="mt-2 text-gray-400">Select a tool to view its logs or interact with its AI agent.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {vendors.map((v) => (
            <div key={v.name}>
              {/* Conditional rendering based on tool type */}
              {v.type === 'mcp' ? (
                <button onClick={() => setChatVendor(v)} className="group text-left w-full h-full">
                  <VendorCard vendor={v} />
                </button>
              ) : (
                <Link href={v.link} className="group">
                  <VendorCard vendor={v} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </main>
      
      {chatVendor && (
        <LogChatModal vendor={chatVendor} onClose={() => setChatVendor(null)} />
      )}
      
      <ConsoleLogViewer />
    </div>
  );
}
