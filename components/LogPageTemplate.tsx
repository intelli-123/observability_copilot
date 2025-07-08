// file: components/LogPageTemplate.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

type LogPageTemplateProps = {
  title: string;
  iconSrc?: string;
  iconAlt?: string;
  children: React.ReactNode;
};

export default function LogPageTemplate({ title, iconSrc, iconAlt, children }: LogPageTemplateProps) {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back to Dashboard Link */}
        <div className="mb-2">
          <Link href="/dashboard" className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <header className="flex items-center gap-4">
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
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-400">
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Review recent logs and analyze them with AI.
            </p>
          </div>
        </header>

        {/* This is where the unique page content (logs) will be rendered */}
        {children}
      </div>
    </main>
  );
}
