// file: components/ConsoleLogViewer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { TerminalSquare, X, Trash2 } from 'lucide-react';
import clsx from 'clsx';

type LogEntry = {
  type: 'log' | 'warn' | 'error';
  timestamp: string;
  message: string;
};

export default function ConsoleLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const captureLog = useCallback((type: LogEntry['type']) => {
    const originalLogMethod = console[type];
    console[type] = (...args) => {
      originalLogMethod.apply(console, args);
      setTimeout(() => {
        setLogs(prevLogs => [
          ...prevLogs,
          {
            type,
            timestamp: new Date().toLocaleTimeString(),
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' '),
          },
        ]);
      }, 0);
    };
    return originalLogMethod;
  }, []);

  useEffect(() => {
    const original = {
      log: captureLog('log'),
      warn: captureLog('warn'),
      error: captureLog('error'),
    };
    return () => {
      console.log = original.log;
      console.warn = original.warn;
      console.error = original.error;
    };
  }, [captureLog]);

  const clearLogs = () => setLogs([]);

  const logColors = {
    log: 'text-gray-300',
    warn: 'text-yellow-400',
    error: 'text-red-400',
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-gray-800 border border-gray-700 rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        aria-label="Open Console Logs"
      >
        <TerminalSquare size={24} className="text-white" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full h-2/3 bg-gray-900 border-t-2 border-indigo-500 rounded-t-lg shadow-2xl flex flex-col">
            <header className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2 font-semibold">
                <TerminalSquare size={20} className="text-indigo-400" />
                UI Console Logs
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearLogs} className="p-1 text-gray-400 hover:text-white" aria-label="Clear logs">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-white" aria-label="Close logs">
                  <X size={20} />
                </button>
              </div>
            </header>
            <div className="flex-grow p-3 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs captured yet.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={clsx("flex gap-4 border-b border-gray-800 py-1", logColors[log.type])}>
                    <span className="text-gray-500">{log.timestamp}</span>
                    <span className="flex-grow">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}