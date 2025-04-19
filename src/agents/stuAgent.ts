import { OpenAIChatAdapter } from "@smithery/sdk";
import { OpenAI } from "openai";
import { getMcpClient } from "../lib/mcpClient";

import dotenv from "dotenv";
dotenv.config();

export async function runStuAgent(prompt: string) {
  const client = await getMcpClient();

  console.log("Setting up OpenAI adapter...");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openaiAdapter = new OpenAIChatAdapter(client);

  console.log("Listing available tools...");
  const tools = await openaiAdapter.listTools();
  console.log("Available tools:", JSON.stringify(tools, null, 2));

  const openaiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    tools: tools,
  });

  console.log("Got OpenAI response:", JSON.stringify(openaiResponse, null, 2));

  // Handle the response
  const openaiToolMessages = await openaiAdapter.callTool(openaiResponse);
  console.log(
    "Got OpenAI tool messages:",
    JSON.stringify(openaiToolMessages, null, 2)
  );

  return {
    response: openaiToolMessages[0].content[0],
  };
}
