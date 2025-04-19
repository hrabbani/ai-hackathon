import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as path from "path";

/**
 * A simple test client to verify the Spotify MCP server functionality.
 * This connects to the server, lists the available tools, and tests the search tool.
 */
async function main() {
  console.log("Starting Spotify MCP test client...");

  // Create a transport that communicates with the server
  // This assumes you're running the compiled server.js in the dist folder
  const transport = new StdioClientTransport({
    command: "ts-node",
    args: [path.resolve("src/index.ts")],
  });

  // Create an MCP client
  const client = new Client({
    name: "spotify-test-client",
    version: "0.1.0",
  });

  try {
    // Connect to the server
    console.log("Connecting to Spotify MCP server...");
    await client.connect(transport);
    console.log("Connected successfully!");

    // List tools to check if the search tool is registered
    console.log("\nListing available tools...");
    const toolsRes = await client.listTools();
    const tools = await toolsRes.tools;
    console.log(`Found ${toolsRes.tools.length} tools:`);
    tools.forEach((tool) => {
      console.log(`- ${tool.name}: ${tool.description || "No description"}`);
    });

    // Check if the search tool exists
    const searchTool = tools.find((tool) => tool.name === "search");
    if (!searchTool) {
      throw new Error(
        "Search tool not found! Check your server implementation."
      );
    }

    // Call the search tool with a test query
    console.log("\nTesting search tool...");
    const searchResult = await client.callTool({
      name: "search",
      arguments: {
        query: "songs related to Bohemian Rhapsody",
        type: "track",
      },
    });

    // Display search results
    console.log("Search tool response:");
    console.log(JSON.stringify(searchResult, null, 2));

    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Disconnect the client
    console.log("\nDisconnecting from server...");
    client.close();
    console.log("Disconnected");
    process.exit(0);
  }
}

// Run the test
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
