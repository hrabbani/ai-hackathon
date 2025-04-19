import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function findMusic(query: string) {
  console.error("Starting findMusic with query:", query);
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
    console.log("Connecting to server...");
    // Connect to the server
    await client.connect(transport);

    console.log("Getting tailored query...");
    // in here prompt engineer the inputted query into a ask from spotify
    const tailoredQueries = await tailorSearchQuery(query);

    console.log("Tailored query:", tailoredQueries);

    const queries = tailoredQueries.split(",");
    console.log("Split queries:", queries);

    // Array to store all search results
    const allSearchResults = [];

    // Perform search for each query
    for (const query of queries) {
      const searchResult = await client.callTool({
        name: "search",
        arguments: {
          query: query,
          type: "track",
        },
      });
      allSearchResults.push(
        searchResult as { content: Array<{ type: string; text: string }> }
      );
    }

    const combinedTracks = allSearchResults.flatMap((result) => {
      const parsed = JSON.parse(result.content[0].text);
      return parsed.tracks;
    });

    return { tracks: combinedTracks };

    // return allSearchResults;
  } catch (error) {
    console.error("Error searching for music:", error);
    throw error;
  } finally {
    client.close();
  }
}

async function tailorSearchQuery(userQuery: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Convert this music search query into an optimal Spotify search query. Focus on key elements like artist names, song titles, genres, or musical characteristics. If the prompt asks specifically to not have an artist, exclued that artist from results. We will aim for three different search results that will help bring variety into the search results. Only return the three different searches seperated by commas with no spaces in between, nothing else. 
            
            Query: ${userQuery}`,
        },
      ],
    });

    // Fix: Access the text content correctly from the message response
    return message.content[0].type === "text"
      ? message.content[0].text
      : userQuery;
  } catch (error) {
    console.error("Error enhancing query with Claude:", error);
    // If Claude fails, return the original query as a fallback
    return userQuery;
  }
}
