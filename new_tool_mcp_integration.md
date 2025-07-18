## How to Add a New MCP Integration

This document outlines the standard procedure for adding a new interactive AI agent (powered by a Model Context Protocol server) to the Observability Copilot. This pattern is for tools that require an interactive, query-based chat interface rather than a static log viewer.

We will use a hypothetical "MCP for Azure" integration as an example.

# Step 1: Add the Tool to the Settings Configuration
This step makes the new tool appear on the main settings page, allowing users to configure the necessary credentials for the MCP server.

- **File to Edit:** `constants/tools.ts`

- **Why:** This file is the single source of truth for all configurable tools. The settings UI is dynamically generated from this list.

**Action:**
Add a new ToolConfig object to the TOOL_CONFIGS array. Define the key (a unique identifier), name, logo, and the specific fields required for its configuration.

Example for Azure:

``` ts
// file: constants/tools.ts

export const TOOL_CONFIGS: ToolConfig[] = [
  // ... (your existing tool configs)
  
  {
    key: 'mcp-azure',
    name: 'MCP for Azure',
    description: 'Provide Azure credentials to enable the MCP server.',
    logo: '/logos/azure.png', // Ensure azure.png is in /public/logos
    fields: [
      { key: 'AZURE_TENANT_ID', label: 'Azure Tenant ID', placeholder: 'Enter your Tenant ID' },
      { key: 'AZURE_CLIENT_ID', label: 'Azure Client ID', placeholder: 'Enter your Client ID' },
      { key: 'AZURE_CLIENT_SECRET', label: 'Azure Client Secret', placeholder: 'Enter your Client Secret', type: 'password' },
      { key: 'AZURE_SUBSCRIPTION_ID', label: 'Azure Subscription ID', placeholder: 'Enter your Subscription ID' },
    ],
  },
];
```
---
## Step 2: Add the Tool to the Dashboard Vendor List
This step makes the card for your new tool appear on the main dashboard after it has been configured.

- **File to Edit:** `utils/envUtils.ts`

- **Why:** The dashboard uses this list to know which vendors are available. By setting type: 'mcp', we ensure that clicking the card will open the interactive chat modal instead of navigating to a new page.

**Action:**
Add a new object to the getVendorList array. The key must match the key you used in constants/tools.ts.

Example for Azure:
``` ts
// file: utils/envUtils.ts

export const getVendorList = () => {
  return [
    // ... (your existing vendors)
    
    {
      key: 'mcp-azure',
      name: 'MCP for Azure',
      logo: '/logos/azure.png',
      link: '/logs/mcp-azure', // This is still used internally
      type: 'mcp', // This is the most important part
    },
  ] as const;
};
```
---

## Step 3: Create the Backend API Route
This is the server-side endpoint that will launch the MCP server as a subprocess and handle communication with the Gemini AI agent.

**File to Create:** `app/api/mcp-azure/query/route.ts`

**Why:** This API acts as a secure bridge. It fetches the credentials from your database, launches the MCP tool in a controlled environment, and returns the AI's response to the user.

**Action:**
Create the new file and add the logic to launch the MCP server and run the AI agent. You can use the code below as a template, replacing the command and args with the actual command for the Azure MCP server.

Example for Azure:
``` ts
// file: app/api/mcp-azure/query/route.ts

import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import { GoogleGenerativeAI, FunctionCallingConfigMode, mcpToTool } from '@google/genai';
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

    // 2. Configure the MCPClient to launch the server with the correct credentials
    const serverParams = new StdioClientTransport({
      command: 'npx',
      // IMPORTANT: Replace this with the actual package name for the Azure MCP server
      args: ['-y', '@example/mcp-server-azure'], 
      env: {
        AZURE_TENANT_ID: azureConfig.AZURE_TENANT_ID,
        AZURE_CLIENT_ID: azureConfig.AZURE_CLIENT_ID,
        AZURE_CLIENT_SECRET: azureConfig.AZURE_CLIENT_SECRET,
        AZURE_SUBSCRIPTION_ID: azureConfig.AZURE_SUBSCRIPTION_ID,
      },
    });

    const client = new Client({ name: 'observability-copilot-client', version: '1.0.0' });
    await client.connect(serverParams);

    // 3. Create a tool from the MCP client and initialize the Gemini model
    const tool = mcpToTool(client);
    const ai = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 4. Run the query through the AI model with the Azure tool
    logger.info({ query }, "Sending query to Azure agent...");
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: query }] }],
      tools: [tool],
      toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
      }
    });

    await client.close();
    const resultText = response.response.text();
    logger.info("Successfully received result from Azure agent.");

    return NextResponse.json({ result: resultText });

  } catch (error: any) {
    logger.error({ err: error }, 'Error in MCP Azure query route.');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```
By following these three steps, you can add any new MCP-based integration to the application, providing a consistent and powerful interactive chat experience for your users.