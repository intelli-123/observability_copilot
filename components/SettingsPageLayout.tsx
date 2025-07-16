// file: components/SettingsPageLayout.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

type SettingsPageLayoutProps = {
  title: string;
  description: string;
  backLink?: { href: string; text: string };
  iconSrc?: string;
  children: React.ReactNode;
};

export default function SettingsPageLayout({
  title,
  description,
  backLink = { href: '/dashboard', text: 'Back to Dashboard' },
  iconSrc,
  children,
}: SettingsPageLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Link href={backLink.href} className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            {backLink.text}
          </Link>
          <header className="flex items-center gap-4 mt-2">
            {iconSrc && (
              <Image
                src={iconSrc}
                alt={`${title} Logo`}
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
          </header>
        </div>

        {/* Page-specific content is rendered here */}
        {children}
      </div>
    </main>
  );
}

