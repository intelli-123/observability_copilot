// file: components/GeminiChatWidget.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, User, Bot, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import Markdown from 'react-markdown';

// Define types directly in the component
interface Props {
  logs: string | Record<string, string>;
  enableDropdown?: boolean;
}

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function GeminiChatWidget({ logs, enableDropdown = false }: Props) {
  // --- State from GeminiChatWidget ---
  const [isOpen, setIsOpen] = useState(false);
  
  // --- State from AskGemini ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Logic to handle log source selection (if dropdown is enabled)
  const logSources = logs && typeof logs === 'object' && !Array.isArray(logs) ? Object.keys(logs) : ['Logs'];
  const [selectedLogSource, setSelectedLogSource] = useState(logSources[0]);
  
  const currentLogs = typeof logs === 'string' ? logs : logs[selectedLogSource] ?? '';

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, pending, isOpen]);

  // Handle form submission to Gemini API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || pending) return;

    const userMessage: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMessage]);
    setPending(true);
    setInput('');

    try {
      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context: currentLogs }),
      });
      const { answer = 'No answer', error } = await res.json();
      const modelMessage: Message = { role: 'model', content: error ?? answer };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: Message = { role: 'model', content: `Error: ${err.message}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .bob-animation { animation: bob 3s ease-in-out infinite; }
      `}</style>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={clsx(
          "fixed bottom-6 right-6 z-50 rounded-full shadow-2xl transition-all duration-300 ease-in-out",
          "hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50",
          !isOpen && "bob-animation"
        )}
        aria-label="Toggle Gemini Chat"
      >
        {isOpen ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-white">
            <X size={28} />
          </div>
        ) : (
          <Image
            src="/chatbot.avif"
            alt="Gemini Chatbot"
            width={64}
            height={64}
            className="rounded-full object-cover"
            unoptimized
          />
        )}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div
          className={clsx(
            'fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] rounded-2xl shadow-2xl flex flex-col',
            'bg-gray-800/80 backdrop-blur-lg border border-white/10'
          )}
        >
          {/* Header */}
          <header className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
            <span className="text-md font-bold text-white">Ask Gemini</span>
            {enableDropdown && (
              <select
                value={selectedLogSource}
                onChange={(e) => setSelectedLogSource(e.target.value)}
                className="text-xs bg-white/10 text-white px-2 py-1 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              >
                {logSources.map((t) => (
                  <option key={t} className="bg-gray-800">{t}</option>
                ))}
              </select>
            )}
          </header>

          {/* Chat Body */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 text-gray-200 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex items-start gap-3", msg.role === 'user' && "justify-end")}>
                {msg.role === 'model' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                <div className={clsx("max-w-[85%] rounded-2xl px-4 py-2 text-sm", msg.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200")}>
                  <div className="prose prose-sm prose-invert"><Markdown>{msg.content}</Markdown></div>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {pending && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><Bot size={18} className="text-white" /></div>
                <div className="bg-gray-700 rounded-2xl px-4 py-2 text-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                  <span className="text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-lg p-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ask about the logs…"
              disabled={pending}
            />
            <button
              type="submit"
              disabled={pending}
              className="bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 text-sm hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </>
  );
}



// // file: components/GeminiChatWidget.tsx
// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import Image from 'next/image';
// import { X } from 'lucide-react';
// import AskGemini from './AskGemini';
// import clsx from 'clsx';

// interface Props {
//   logs: string | Record<string, string>;
//   enableDropdown?: boolean;
// }

// export default function GeminiChatWidget({ logs, enableDropdown = false }: Props) {
//   // --- All existing functionality remains unchanged ---
//   const tools =
//     logs && typeof logs === 'object' && !Array.isArray(logs)
//       ? Object.keys(logs)
//       : ['Logs'];
//   if (!logs) {
//     console.warn('GeminiChatWidget: "logs" prop is undefined or null.');
//   }

//   const [tool, setTool] = useState(tools[0]);
//   const [open, setOpen] = useState(false);
//   const boxRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (open && boxRef.current) {
//       boxRef.current.scrollTop = boxRef.current.scrollHeight;
//     }
//   });

//   return (
//     <>
//       {/* Add custom animation styles */}
//       <style jsx global>{`
//         @keyframes bob {
//           0%, 100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-6px);
//           }
//         }
//         .bob-animation {
//           animation: bob 3s ease-in-out infinite;
//         }
//       `}</style>

//       {/* --- Revamped Floating Button --- */}
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className={clsx(
//           "fixed bottom-6 right-6 z-50 rounded-full shadow-2xl transition-all duration-300 ease-in-out",
//           "hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50",
//           !open && "bob-animation" // Apply bobbing animation only when closed
//         )}
//         aria-label="Toggle Gemini Chat"
//       >
//         {open ? (
//           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-white">
//             <X size={28} />
//           </div>
//         ) : (
//           <Image
//             src="/chatbot.avif" // Assumes your image is at public/chatbot.avif
//             alt="Gemini Chatbot"
//             width={64} // 4rem
//             height={64} // 4rem
//             className="rounded-full object-cover"
//             unoptimized // Use this if your AVIF is already animated
//           />
//         )}
//       </button>

//       {/* --- Revamped Chat Box --- */}
//       {open && (
//         <div
//           className={clsx(
//             'fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] rounded-2xl shadow-2xl flex flex-col',
//             'bg-gray-800/80 backdrop-blur-lg border border-white/10'
//           )}
//         >
//           {/* Header */}
//           <header className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
//             <span className="text-md font-bold text-white">Ask Gemini</span>
            
//             {enableDropdown && (
//               <select
//                 value={tool}
//                 onChange={(e) => setTool(e.target.value)}
//                 className="text-xs bg-white/10 text-white px-2 py-1 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
//               >
//                 {tools.map((t) => (
//                   <option key={t} className="bg-gray-800">{t}</option>
//                 ))}
//               </select>
//             )}
//           </header>

//           {/* AskGemini Body */}
//           {/* 👇 Added 'text-gray-200' to set a light default text color */}
//           <div ref={boxRef} className="flex-1 overflow-y-auto p-4 text-white">
//             <AskGemini
//               logs={typeof logs === 'string' ? logs : logs[tool] ?? ''}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // // components/GeminiChatWidget.tsx
// // 'use client';

// // import { useEffect, useRef, useState } from 'react';
// // import { MessageSquare, X } from 'lucide-react';
// // import AskGemini from './AskGemini';
// // import clsx from 'clsx';

// // interface Props {
// //   logs: string | Record<string, string>; // single string OR {tool: logs}
// //   enableDropdown?: boolean;              // true on dashboard
// // }

// // export default function GeminiChatWidget({ logs, enableDropdown = false }: Props) {
// //   // if logs is object => dropdown; if string => fixed context
// //   //const tools = typeof logs === 'string' ? ['Logs'] : Object.keys(logs);
// //   const tools =
// //   logs && typeof logs === 'object' && !Array.isArray(logs)
// //     ? Object.keys(logs)
// //     : ['Logs'];
// //     if (!logs) {
// //   console.warn('GeminiChatWidget: "logs" prop is undefined or null.');
// // }


// //   const [tool, setTool] = useState(tools[0]);
// //   const [open, setOpen] = useState(false);
// //   const boxRef = useRef<HTMLDivElement>(null);

// //   // scroll to bottom on new answer
// //   useEffect(() => {
// //     if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
// //   });

// //   return (
// //     <>
// //       {/* Floating icon */}
// //       <button
// //         onClick={() => setOpen((o) => !o)}
// //         className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-indigo-600 text-black shadow-lg hover:scale-110 transition"
// //         aria-label="Gemini chat"
// //       >
// //         {open ? <X size={18} /> : <MessageSquare size={20} />}
// //       </button>

// //       {/* Chat box */}
// //       {open && (
// //         <div
// //           className={clsx(
// //             'fixed bottom-24 right-6 z-50 w-[350px] max-h-[520px] bg-background border rounded-xl shadow-lg flex flex-col',
// //             'dark:bg-muted bg-white text-foreground'
// //           )}
// //         >
// //           {/* Header */}
// //           <div className="flex items-center justify-between p-2 border-b bg-indigo-100 dark:bg-indigo-900">
// //             <span className="text-sm font-semibold">Ask&nbsp;Gemini</span>

// //             {enableDropdown && (
// //               <select
// //                 value={tool}
// //                 onChange={(e) => setTool(e.target.value)}
// //                 className="text-xs bg-muted px-1 py-0.5 rounded"
// //               >
// //                 {tools.map((t) => (
// //                   <option key={t}>{t}</option>
// //                 ))}
// //               </select>
// //             )}

// //             <button
// //               onClick={() => setOpen(false)}
// //               className="text-xs text-red-500 hover:underline ml-2"
// //             >
// //               Close
// //             </button>
// //           </div>

// //           {/* AskGemini body */}
// //           <div ref={boxRef} className="flex-1 overflow-y-auto p-3">
// //             <AskGemini
// //               logs={typeof logs === 'string' ? logs : logs[tool] ?? ''}
// //             />
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
