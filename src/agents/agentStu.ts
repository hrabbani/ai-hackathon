import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as path from "path";

export async function findMusic(query: string) {
  // Create a transport that communicates with the server
  const transport = new StdioClientTransport({
    command: "ts-node",
    args: [path.resolve("src/lib/mcp/server.ts")],
  });

  // Create an MCP client
  const client = new Client({
    name: "spotify-search-client",
    version: "0.1.0",
  });

  try {
    // Connect to the server
    await client.connect(transport);

    // Call the search tool
    const searchResult = await client.callTool({
      name: "search",
      arguments: {
        query: query,
        type: "track",
      },
    });

    return searchResult;
  } catch (error) {
    console.error("Error searching for music:", error);
    throw error;
  } finally {
    client.close();
  }
}
