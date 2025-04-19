import { createTransport } from "@smithery/sdk/transport.js";
// import { MultiClient } from "@smithery/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import dotenv from "dotenv";
dotenv.config();

let _client: Client | null = null;

export async function getMcpClient() {
  if (_client) return _client;

  try {
    const exaTransport = createTransport(
      "https://server.smithery.ai/exa/ws",
      {
        exaApiKey: process.env.EXA_API_KEY,
      },
      process.env.SMITHERY_API_KEY
    );

    console.log("Initializing MCP client...");
    const client = new Client({
      name: "Stu-Agent",
      version: "1.0.0",
    });

    console.log("Attempting to connect to transport...");
    await client.connect(exaTransport);
    console.log("Successfully connected to transport!");

    _client = client;
    return client;
  } catch (error) {
    console.error("Error in MCP client setup:", error);
    throw error;
  }
}
