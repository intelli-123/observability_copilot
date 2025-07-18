// file: app/page.tsx
// main login screen
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin') {
      router.push('/dashboard');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  const ObservabilityIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-24 w-24 text-violet-400 drop-shadow-md"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M20.94 10.94a9 9 0 1 1-1.41-1.41" />
      <path d="M15.54 6.46l-1.08 1.08" />
      <path d="M6.46 15.54l-1.08 1.08" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-gray-200 font-sans">
      {/* Left Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-16 py-12 bg-gradient-to-br from-slate-900 to-slate-800 text-center">
        <ObservabilityIcon />
        <div className="flex items-center gap-4 mt-6">
          <Image
            src="/intell_logo_1.png"
            alt="IntelliTrace Logo"
            width={50}
            height={50}
            className=""
          />
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Observability Copilot
          </h2>
        </div>
        <p className="mt-4 text-lg text-gray-400 max-w-sm">
          Unify your logs, metrics, and traces — powered by AI-driven insight.
        </p>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-400">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-400 bg-red-950 border border-red-800 rounded p-2 text-center animate-pulse">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 transition-colors rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500"
            >
              Login
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-gray-500 mt-8">
            &copy; {new Date().getFullYear()} Intellishift. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
