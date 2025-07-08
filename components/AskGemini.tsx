'use client';

import { useRef, useState, useEffect } from 'react';
import { User, Bot, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import Markdown from 'react-markdown';

interface Props {
  logs: string;
}

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AskGemini({ logs }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, pending]);

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
        body: JSON.stringify({ question: q, context: logs }),
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

  const MessageBubble = ({ msg }: { msg: Message }) => {
    const isUser = msg.role === 'user';
    return (
      <div className={clsx("flex items-start gap-3 my-4", isUser && "justify-end")}>
        {msg.role === 'model' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
        )}
        
        {/* 👇 This is the corrected part */}
        <div className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
          isUser ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
        )}>
          {/* Apply styling to the wrapper div, not the Markdown component */}
          <div className="prose prose-sm prose-invert">
            <Markdown>{msg.content}</Markdown>
          </div>
        </div>

        {msg.role === 'user' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full text-gray-200">
      <div ref={chatContainerRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {pending && (
           <div className="flex items-start gap-3">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
               <Bot size={18} className="text-white" />
             </div>
             <div className="bg-gray-700 rounded-2xl px-4 py-2 text-sm flex items-center gap-2">
               <Loader2 size={16} className="animate-spin text-gray-400" />
               <span className="text-gray-400">Thinking...</span>
             </div>
           </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 mt-4 border-t border-white/10">
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
  );
}




// //file: components\AskGemini.tsx
// 'use client';
// import { useRef, useState } from 'react';

// interface Props { logs: string }

// export default function AskGemini({ logs }: Props) {
//   const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
//   const [pending, setPending] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const send = async () => {
//     const q = inputRef.current?.value.trim();
//     if (!q) return;

//     setPending(true);
//     try {
//       const res = await fetch('/api/gemini/ask', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ question: q, context: logs }),
//       });
//       const { answer = 'No answer', error } = await res.json();
//       setChat((c) => [...c, { q, a: error ?? answer }]);
//     } finally {
//       setPending(false);
//       if (inputRef.current) inputRef.current.value = '';
//     }
//   };

//   return (
//     <div className="flex flex-col gap-3 text-black dark:text-black">
//       <div className="space-y-2 max-h-[330px] overflow-y-auto pr-1">
//         {chat.map(({ q, a }, i) => (
//           <div key={i}>
//             <p className="text-right text-blue-600 text-sm">{q}</p>
//             <pre className="text-sm whitespace-pre-wrap">{a}</pre>
//           </div>
//         ))}
//       </div>

//       <div className="flex gap-2">
//         <input
//           ref={inputRef}
//           className="flex-1 border px-2 py-1 rounded text-sm text-black"
//           placeholder="Ask about the logs…"
//           disabled={pending}
//           onKeyDown={(e) => e.key === 'Enter' && send()}
//         />
//         <button
//           onClick={send}
//           disabled={pending}
//           className="bg-indigo-600 text-black px-3 py-1 rounded text-sm disabled:opacity-50"
//         >
//           {pending ? '...' : 'Ask'}
//         </button>
//       </div>
//     </div>
//   );
// }



