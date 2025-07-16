// file: app/api/mcp-salesforce/chat/route.ts

import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import { GoogleGenAI, FunctionCallingConfigMode, mcpToTool } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import logger from '@/utils/logger';

const redis = createClient({ url: process.env.REDIS_URL });

async function ensureRedisConnection() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

const SETTINGS_KEY = 'app_tool_configurations';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    // 1. Fetch the saved Salesforce credentials from Redis
    await ensureRedisConnection();
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) throw new Error('Salesforce settings not found in database.');
    
    const settings: any = JSON.parse(settingsString);
    const salesforceConfig = settings.configs?.['mcp-salesforce'];

    if (!salesforceConfig?.SALESFORCE_INSTANCE_URL) {
      throw new Error('Salesforce credentials are not fully configured in settings.');
    }

    // --- This is your correct logic, now integrated ---
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const serverParams = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@tsmztech/mcp-server-salesforce'],
      env: {
        SALESFORCE_INSTANCE_URL: salesforceConfig.SALESFORCE_INSTANCE_URL?.trim(),
        SALESFORCE_CONNECTION_TYPE: "User_Password",
        SALESFORCE_USERNAME: salesforceConfig.SALESFORCE_USERNAME?.trim(),
        SALESFORCE_PASSWORD: salesforceConfig.SALESFORCE_PASSWORD?.trim(),
        SALESFORCE_TOKEN: salesforceConfig.SALESFORCE_TOKEN?.trim(),
      }
    });

    const client = new Client({ name: 'observability-copilot-client', version: '1.0.0' });
    await client.connect(serverParams);

    const tool = mcpToTool(client);

    logger.info({ query }, "Sending query to Salesforce agent...");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        tools: [tool],
        // @ts-expect-error: functionCallingConfig is valid at runtime
        functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
      }
    });

    await client.close();

    const resultText = response.text;
    logger.info("Successfully received result from Salesforce agent.");

    return NextResponse.json({ result: resultText });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in MCP Salesforce chat route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
