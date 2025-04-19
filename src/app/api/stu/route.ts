import { runStuAgent } from "@/agents/stuAgent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const result = await runStuAgent(prompt);

  return NextResponse.json(result);
}
