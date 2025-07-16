// file: app/api/mcp-cloudwatch/query/route.ts

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

    // 2. Initialize the AI and MCP client
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // 👇 This section is updated to use the Node.js MCP server
    const serverParams = new StdioClientTransport({
      command: 'amazon-cloudwatch-logs-mcp-server', // Use npx to run the Node.js package
      //args: ['C:\\Users\\KiranKumar\\Downloads\\observability_cig\\mcp-amazon-cloudwatch-logs\\src\\index.ts'], // The package name from the URL
      env: {
        ...process.env, // Pass through existing env vars
        AWS_ACCESS_KEY_ID: awsConfig.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: awsConfig.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: awsConfig.AWS_REGION,
      }
    });

    const client = new Client({ name: 'cloudwatch-client', version: '1.0.0' });
    await client.connect(serverParams);

    // 3. Create a tool from the MCP client and initialize the Gemini model
    const tool = mcpToTool(client);
  
    // const fullPrompt = `
    // SYSTEM INSTRUCTIONS:
    // You are an expert at querying AWS CloudWatch Logs.

    // Your task is to take a user's natural language query and convert it into a valid tool call for the CloudWatch Logs tool. The tool provides a function named 'get_log_events', which requires two parameters:

    // - startTime: in milliseconds since the epoch (Unix time)
    // - endTime: in milliseconds since the epoch

    // If the user's query includes a relative time frame (e.g., "past 5 days", "last 24 hours", "yesterday"), you MUST compute the appropriate startTime and endTime values yourself based on the current time.

    // ⚠️ Do NOT ask the user to provide startTime or endTime if a relative time frame is already given.

    // USER QUESTION:
    // ${query}
    // `;

  

    // // 4. Run the query through the AI model with the CloudWatch tool
    // logger.info({ query }, "Sending query to CloudWatch agent...");
    // const response = await ai.models.generateContent({
    //   model: 'gemini-2.0-flash',
    //   //contents: [{ role: 'user', parts: [{ text: query }] }],
    //   contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    //   config: {
    //     tools: [tool],
    //     // @ts-expect-error: functionCallingConfig is valid at runtime
    //     functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
    //   }
    // });

    const fullPrompt = `
    SYSTEM INSTRUCTIONS:
    You are an expert at querying AWS CloudWatch Logs.

    Your task is to take a user's natural language query and convert it into a valid tool call for the CloudWatch Logs tool. The tool provides a function named 'get_log_events', which requires two parameters:

    - startTime: in milliseconds since the epoch (Unix time)
    - endTime: in milliseconds since the epoch

    If the user's query includes a relative time frame (e.g., "past 5 days", "last 24 hours", "yesterday"), you MUST compute the appropriate startTime and endTime values yourself based on the current time.

    ⚠️ Do NOT ask the user to provide startTime or endTime if a relative time frame is already given.

    USER QUESTION:
    ${query}
    `.trim();

    logger.info({ query, fullPrompt }, "Sending query to CloudWatch agent...");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      config: {
        tools: [tool],
        // @ts-expect-error: functionCallingConfig is valid at runtime
        functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
      }
    });


    await client.close();
    const resultText = response.text;
    logger.info("Successfully received result from CloudWatch agent.");

    return NextResponse.json({ result: resultText });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in MCP CloudWatch query route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
