import { spotifyClient } from "@/lib/mcp/spotify-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const results = await spotifyClient.search(query, "track");
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching for music:", error);
    return NextResponse.json(
      { error: "Failed to search for music" },
      { status: 500 }
    );
  }
}
