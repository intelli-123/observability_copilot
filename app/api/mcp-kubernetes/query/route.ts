// file: app/api/mcp-kubernetes/query/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenAI, FunctionCallingConfigMode, mcpToTool } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import logger from '@/utils/logger';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    // --- This is the new, dynamic path logic ---
    // It constructs the path to '.kube/config' inside your project's root directory.
    const kubeConfigPath = path.join(process.cwd(), '.kube', 'config');
    logger.info({ kubeConfigPath }, 'Using kubeconfig file for Kubernetes MCP server.');
    // ---------------------------------------------

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const serverParams = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'kubernetes-mcp-server@latest'],
      env: {
        ...process.env,
        KUBECONFIG: kubeConfigPath, // Pass the dynamically found path to the server
      }
    });

    const client = new Client({ name: 'kubernetes-client', version: '1.0.0' });
    await client.connect(serverParams);

    const tool = mcpToTool(client);
   
    logger.info({ query }, "Sending query to Kubernetes agent...");

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: query }] }],
        config: {
          tools: [tool],
          // @ts-expect-error
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
        }
      });

    await client.close();
    const resultText = response.text;
    logger.info("Successfully received result from Kubernetes agent.");

    return NextResponse.json({ result: resultText });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in MCP Kubernetes query route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
