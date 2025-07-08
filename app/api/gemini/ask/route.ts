//file: app\api\gemini\ask\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-1.5-flash';

export async function POST(req: NextRequest) {
  const { question, context } = await req.json() as {
    question: string;
    context:  string;
  };

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  }

  try {
    /*  initialise model */
    const ai    = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: MODEL });

    /*  prompt (context already contains build summary + truncated logs) */
    const prompt =
      'You are an assistant analysing Jenkins console logs.\n' +
      'Answer strictly from the provided context. If you cannot, say "I don’t see that in the logs."\n\n' +
      '### Context ↓↓↓\n' +
      context.slice(0, 25_000) +               // keep well under 32k tokens
      '\n\n### Question\n' +
      question;

    const r       = await model.generateContent(prompt);
    const answer  = r.response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No answer';

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error('Gemini error', err.message);
    return NextResponse.json({ error: 'Gemini request failed' }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const MODEL_NAME = 'gemini-1.5-flash';          // or gemini-pro

// export async function POST(req: NextRequest) {
//   const { question, context } = await req.json();  // question:string, context:string (logs)

//   if (!process.env.GEMINI_API_KEY) {
//     return NextResponse.json({ error: 'Gemini key missing' }, { status: 500 });
//   }

//   try {
//     const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     const model = ai.getGenerativeModel({ model: MODEL_NAME });

//     const prompt = `
// You are an observability assistant.  Answer the user's question using the logs.
// If the answer is not in the logs, say "I don't see that in the logs."

// ### Logs
// ${context.slice(-15_000)}   <!-- keep prompt smaller than 30k for safety -->

// ### Question
// ${question}
// `;

//     const result = await model.generateContent(prompt);
//     const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No answer';

//     return NextResponse.json({ answer });
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }
