// file: components/LogChatModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Send, User, Bot } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import Markdown from 'react-markdown';

// Define the shape of the vendor prop
interface Vendor {
  key: string;
  name: string;
  logo: string;
}

interface Props {
  vendor: Vendor;
  onClose: () => void;
}

type Message = {
  role: 'user' | 'model';
  content: string;
};

// --- Dynamic Example Queries ---
const exampleQueries: Record<string, string> = {
  'jenkins': 'e.g., "Which builds failed in the last 24 hours?"',
  'gcp': 'e.g., "Show me all critical errors from the past hour."',
  'cloudwatch': 'e.g., "List all log groups in the us-east-1 region."',
  'mcp-salesforce': 'e.g., "Find all open opportunities for the Acme Corp account."',
  'mcp-cloudwatch': 'e.g., "Summarize the errors from the last hour."',
  'mcp-azure': 'e.g., "List all storage accounts."',
  'gitlab': 'e.g., "Show me the latest commits to the main branch."',
  'default': 'e.g., "Summarize the recent activity."',
};
// -----------------------------

export default function LogChatModal({ vendor, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const apiPath = `/api/${vendor.key}/query`;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userQuery = input.trim();
    if (!userQuery || isLoading) return;

    const userMessage: Message = { role: 'user', content: userQuery };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query.');
      }
      
      const modelMessage: Message = { role: 'model', content: data.result };
      setMessages(prev => [...prev, modelMessage]);

    } catch (err: any) {
      const errorMessage: Message = { role: 'model', content: `Error: ${err.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the specific example query for the current vendor
  const exampleQuery = exampleQueries[vendor.key] || exampleQueries['default'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-4xl h-[90vh] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Image src={vendor.logo} alt={vendor.name} width={32} height={32} />
            <h2 className="text-xl font-bold text-white">Chat with {vendor.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white">
            <X size={24} />
          </button>
        </header>

        {/* Chat History Area */}
        <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                <p>Ask a question to get started.</p>
                {/* This now displays the dynamic example query */}
                <p className="text-sm mt-2">{exampleQuery}</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={clsx("flex items-start gap-4", msg.role === 'user' && "justify-end")}>
              {msg.role === 'model' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
              )}
              <div className={clsx("max-w-[85%] rounded-2xl px-4 py-3 text-sm", msg.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200")}>
                <div className="prose prose-sm prose-invert max-w-none"><Markdown>{msg.content}</Markdown></div>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-4">
               <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center"><Bot size={20} className="text-white" /></div>
               <div className="bg-gray-700 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin text-gray-400" />
                 <span className="text-gray-400">Agent is thinking...</span>
               </div>
             </div>
          )}
        </div>

        {/* Input Form Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-2xl flex-shrink-0">
          <form onSubmit={handleQuerySubmit} className="flex items-center gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-lg p-3 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Ask a question about ${vendor.name}...`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white font-semibold rounded-lg px-5 py-3 hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
