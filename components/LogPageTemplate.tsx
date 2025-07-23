// file: components/LogPageTemplate.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, RefreshCw } from 'lucide-react'; // Import the Refresh icon

type LogPageTemplateProps = {
  title: string;
  description: string;
  iconSrc?: string;
  iconAlt?: string;
  // This new prop will be a function to trigger a refetch
  onRefresh?: () => void; 
  isRefreshing?: boolean; // To show a loading state on the button
  children: React.ReactNode;
};

export default function LogPageTemplate({
  title,
  description,
  iconSrc,
  iconAlt,
  onRefresh,
  isRefreshing,
  children,
}: LogPageTemplateProps) {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
          <header className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              {iconSrc && (
                <Image
                  src={iconSrc}
                  alt={iconAlt || 'Logo'}
                  width={60}
                  height={60}
                  className="rounded-md"
                />
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {title}
                </h1>
                <p className="mt-2 text-gray-400">
                  {description}
                </p>
              </div>
            </div>
            
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </header>
        </div>

        {children}
      </div>
    </main>
  );
}
