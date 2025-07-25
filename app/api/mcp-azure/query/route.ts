// file: app/api/mcp-azure/query/route.ts

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

    // 1. Fetch the saved Azure credentials from Redis
    await ensureRedisConnection();
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) throw new Error('Azure settings not found in database.');
    
    const settings: any = JSON.parse(settingsString);
    const azureConfig = settings.configs?.['mcp-azure'];

    if (!azureConfig?.AZURE_CLIENT_ID) {
      throw new Error('Azure credentials are not fully configured in settings.');
    }
    // , '--read-only'
    // 2. Configure the MCPClient to launch the server with the correct credentials
    const serverParams = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@azure/mcp@latest', 'server', 'start', '--read-only'], 
      env: {
        AZURE_TENANT_ID: azureConfig.AZURE_TENANT_ID,
        AZURE_CLIENT_ID: azureConfig.AZURE_CLIENT_ID,
        AZURE_CLIENT_SECRET: azureConfig.AZURE_CLIENT_SECRET,
        AZURE_SUBSCRIPTION_ID: azureConfig.AZURE_SUBSCRIPTION_ID,
      },
    });

    const client = new Client({ name: 'azure-copilot-client', version: '1.0.0' });
    await client.connect(serverParams);

    // 3. Create a tool from the MCP client and initialize the Gemini model
    const tool = mcpToTool(client);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // 4. Run the query through the AI model with the Azure tool
    logger.info({ query }, "Sending query to Azure agent...");
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
    logger.info("Successfully received result from Azure agent.");

    return NextResponse.json({ result: resultText });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in MCP Azure query route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}