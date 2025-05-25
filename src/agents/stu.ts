import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

// Type definitions for actions and responses
export interface FindMusicParams {
  query: string;
}

export interface FindMusicResult {
  tracks: Array<{
    id: string;
    name: string;
    artist: string;
    album: string;
    popularity: number;
  }>;
}

export interface CreatePlaylistParams {
  name: string;
  tracks: string[];
}

export interface CreatePlaylistResult {
  success: boolean;
  playlistId?: string;
  error?: string;
}

// Action types
export type AgentAction =
  | { action: "findMusic"; params: FindMusicParams }
  | { action: "createPlaylist"; params: CreatePlaylistParams };

export type AgentResult = FindMusicResult | CreatePlaylistResult;

/**
 * AgentService - Singleton service that orchestrates AI-powered music operations
 * Manages MCP connections per request and reuses Anthropic client
 */
class AgentService {
  private static instance: AgentService;
  private anthropic: Anthropic;

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  /**
   * Execute an action using the agent
   */
  async executeAction(actionRequest: AgentAction): Promise<AgentResult> {
    switch (actionRequest.action) {
      case "findMusic":
        return this.findMusic(actionRequest.params);
      case "createPlaylist":
        return this.createPlaylist(actionRequest.params);
      default:
        throw new Error(
          `Unknown action: ${(actionRequest as AgentAction).action}`
        );
    }
  }

  /**
   * Find music using AI-enhanced search with MCP
   */
  async findMusic(params: FindMusicParams): Promise<FindMusicResult> {
    console.log("AgentService: Starting findMusic with query:", params.query);

    // Create fresh MCP connection for this request
    const transport = new StdioClientTransport({
      command: "ts-node",
      args: [path.resolve("src/lib/mcp/index.ts")],
    });

    const client = new Client({
      name: "spotify-search-client",
      version: "0.1.0",
    });

    try {
      console.log("AgentService: Connecting to MCP server...");
      await client.connect(transport);

      console.log("AgentService: Getting AI-enhanced queries...");
      const tailoredQueries = await this.tailorSearchQuery(params.query);
      console.log("AgentService: Tailored queries:", tailoredQueries);

      const queries = tailoredQueries.split(",");
      console.log("AgentService: Split queries:", queries);

      // Array to store all search results
      const allSearchResults = [];

      // Perform search for each query using MCP
      for (const query of queries) {
        try {
          const searchResult = await client.callTool({
            name: "search",
            arguments: {
              query: query.trim(),
              type: "track",
            },
          });
          allSearchResults.push(
            searchResult as { content: Array<{ type: string; text: string }> }
          );
        } catch (error) {
          console.error(`AgentService: Error searching for "${query}":`, error);
          // Continue with other queries even if one fails
        }
      }

      // Combine and format results
      const combinedTracks = allSearchResults.flatMap((result) => {
        try {
          const parsed = JSON.parse(result.content[0].text);
          return parsed.tracks || [];
        } catch (error) {
          console.error("AgentService: Error parsing search results:", error);
          return [];
        }
      });

      return { tracks: combinedTracks };
    } catch (error) {
      console.error("AgentService: Error in findMusic:", error);
      throw new Error(
        `Failed to find music: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      console.log("AgentService: Closing MCP connection");
      client.close();
    }
  }

  /**
   * Create playlist (placeholder for future implementation)
   */
  async createPlaylist(
    params: CreatePlaylistParams
  ): Promise<CreatePlaylistResult> {
    console.log("AgentService: createPlaylist called with:", params);

    // Placeholder implementation
    return {
      success: false,
      error: "createPlaylist not yet implemented",
    };
  }

  /**
   * Use Claude to enhance search queries for better Spotify results
   */
  private async tailorSearchQuery(userQuery: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Convert this music search query into an optimal Spotify search query. Focus on key elements like artist names, song titles, genres, or musical characteristics. If the prompt asks specifically to not have an artist, exclude that artist from results. We will aim for three different search results that will help bring variety into the search results. Only return the three different searches separated by commas with no spaces in between, nothing else. 
              
              Query: ${userQuery}`,
          },
        ],
      });

      return message.content[0].type === "text"
        ? message.content[0].text
        : userQuery;
    } catch (error) {
      console.error("AgentService: Error enhancing query with Claude:", error);
      // If Claude fails, return the original query as a fallback
      return userQuery;
    }
  }
}

export const agentService = AgentService.getInstance();
