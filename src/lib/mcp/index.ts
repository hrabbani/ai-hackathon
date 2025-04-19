import { connectServer } from "./server";

/**
 * Main entry point for the Spotify MCP server.
 * Sets up the MCP server and connects the stdio transport.
 */ async function main() {
  try {
    await connectServer();
  } catch (error) {
    console.error("Error starting Spotify MCP server:", error);
    process.exit(1);
  }
}

// Execute the main function
main();
