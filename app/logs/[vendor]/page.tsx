// file: app/logs/[vendor]/page.tsx

import Link from 'next/link';
import { Construction } from 'lucide-react';

// This component receives `params`, which contains the dynamic part of the URL (e.g., "datadog").
export default function VendorComingSoonPage({ params }: { params: { vendor: string } }) {
  // Capitalize the vendor name from the URL for a nice title.
  const vendorName = params.vendor.charAt(0).toUpperCase() + params.vendor.slice(1);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="text-center space-y-6 bg-gray-800 p-10 rounded-2xl border border-gray-700 shadow-xl max-w-md">
        <Construction className="mx-auto text-yellow-400" size={56} strokeWidth={1.5} />
        <h1 className="text-4xl font-bold text-white">
          {vendorName} Integration
        </h1>
        <p className="text-lg text-gray-400">
          This page is under construction and will be available soon.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 px-6 py-3 text-base font-medium rounded-lg shadow-md transition-colors duration-150 ease-in-out bg-indigo-600 hover:bg-indigo-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </main>
  );
}