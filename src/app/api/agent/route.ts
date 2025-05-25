import { AgentAction, agentService } from "@/agents/stu";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request has required action field
    if (!body.action) {
      return NextResponse.json(
        { error: "Missing 'action' field in request" },
        { status: 400 }
      );
    }

    // Validate request has params field
    if (!body.params) {
      return NextResponse.json(
        { error: "Missing 'params' field in request" },
        { status: 400 }
      );
    }

    console.log(
      `API: Received ${body.action} request with params:`,
      body.params
    );

    // Execute the action using the agent service
    const result = await agentService.executeAction(body as AgentAction);

    console.log(`API: ${body.action} completed successfully`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API: Error in agent endpoint:", error);

    // Return structured error response
    return NextResponse.json(
      {
        error: "Agent request failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
