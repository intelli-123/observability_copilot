// // file: app/api/mcp-cloudwatch/query/route.ts

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

    // 1. Fetch the saved AWS credentials from Redis
    await ensureRedisConnection();
    const settingsString = await redis.get(SETTINGS_KEY);
    if (!settingsString) throw new Error('CloudWatch settings not found in database.');
    
    const settings: any = JSON.parse(settingsString);
    const awsConfig = settings.configs?.['mcp-cloudwatch'];

    if (!awsConfig?.AWS_REGION) {
      throw new Error('AWS credentials are not fully configured in settings.');
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const regions = awsConfig.AWS_REGIONS.split(',').map(r => r.trim());
    const results: string[] = [];

    for (const region of regions) {
      const serverParams = new StdioClientTransport({
        command: 'amazon-cloudwatch-logs-mcp-server', 
        env: {
          ...process.env,
          AWS_ACCESS_KEY_ID: awsConfig.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: awsConfig.AWS_SECRET_ACCESS_KEY,
          AWS_REGION: region,
        }
      });

      const client = new Client({ name: 'cloudwatch-client', version: '1.0.0' });
      await client.connect(serverParams);

      const tool = mcpToTool(client);

      const fullPrompt = `
      You are an expert AWS CloudWatch assistant.
      The following query is intended for the AWS region: ${region}.

      When listing log groups, always return a flat human-readable list of **only the logGroupName values**. Do NOT include full JSON objects or metadata fields like arn, storedBytes, or creationTime.

      If the user asks to list log groups, your response MUST look like:
      - /aws/lambda/myFunction
      - /aws/lambda/anotherFunction

      Do not return JSON, only the names of the log groups in plain text format.

      USER QUESTION:
      ${query}
      `.trim();

      logger.info({ query, fullPrompt, region }, "Sending query to CloudWatch agent for region...");

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
          tools: [tool],
          // @ts-expect-error
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
        }
      });

      await client.close();

      const resultText = response.text;
      results.push(`**Region: ${region}**\n${resultText}`);
    }

    logger.info("Successfully received results from all regions.");
    return NextResponse.json({ result: results.join('\n\n') });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in MCP CloudWatch query route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

