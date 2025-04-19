import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { spotifyClient } from "./spotify-api";
import { z } from "zod";

/**
 * Initializes and configures the MCP server with Spotify capabilities.
 * Sets up all available tools and their handlers.
 * @returns Configured MCP server instance
 */
const server = new McpServer({
  name: "SpotifyMCP",
  version: "0.1.0",
});

// Define a search tool with a query parameter
server.tool(
  "search",
  {
    query: z
      .string()
      .describe("Search query for songs, artists, albums, or playlists"),
    type: z
      .enum(["track", "album", "artist", "playlist"])
      .default("track")
      .describe("Type of item to search for"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of results to return"),
  },
  async ({ query, type, limit }) => {
    // For now, we'll just log that search was called
    console.log(`Search was called with query: "${query}", type: "${type}"`);
    try {
      const results = await spotifyClient.search(query, type, limit);

      // Return a simple text response
      return {
        content: [
          {
            type: "text",
            text: `${JSON.stringify(results, null, 2)}`,
            // text: `Searched for "${query}" of type ${type}. Results will be implemented in the future.`,
          },
        ],
      };
    } catch (error) {
      console.error("Error in search tool:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error searching Spotify: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

// Connect function to be called from index.ts
export async function connectServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Spotify MCP server started and waiting for requests...");
}

// /**
//  * Handler for listing available tools that this MCP server provides.
//  * Registers the search, playback control, queue, and info tools.
//  * @returns List of available tools
//  */
// async function handleListTools(): Promise<Tool[]>;

// /**
//  * Processes tool execution requests from the client.
//  * Routes the request to the appropriate handler based on the tool name.
//  * @param name The name of the tool to execute
//  * @param arguments Arguments passed to the tool
//  * @returns Results from the tool execution
//  */
// async function handleCallTool(
//   name: string,
//   arguments: Record<string, any>
// ): Promise<Content[]>;
