import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai-prompt";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

interface IntakePayload {
  orgName: string;
  orgType: string;
  board: string;
  enrolmentRange: string;
  gradeRange: string;
  identifiedRange: string;
  exceptionalities: string[];
  currentStaffing: string;
  currentResources: string;
  challenges: string;
  budgetRange: string;
  goals: string;
  contactEmail: string;
  consent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IntakePayload;

    // Validate required fields
    if (!body.orgName || !body.contactEmail || !body.consent) {
      return NextResponse.json(
        { error: "Please fill in all required fields and provide consent." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitResult = checkRateLimit(ip, body.contactEmail);
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    // Build the user message for Claude
    const userMessage = `School Profile for Program Framework Generation:

- Organization: ${body.orgName}
- Type: ${body.orgType || "Not specified"}
- Board: ${body.board || "Not specified"}
- Total Enrolment: ${body.enrolmentRange || "Not specified"}
- Grade Range: ${body.gradeRange || "Not specified"}
- Approx. Students with Identified Needs: ${body.identifiedRange || "Not specified"}
- Exceptionality Areas Present: ${body.exceptionalities?.length ? body.exceptionalities.join(", ") : "Not specified"}
- Current Special Education Staffing: ${body.currentStaffing || "Not specified"}
- Existing Programs & Resources: ${body.currentResources || "Not specified"}
- Top Challenges: ${body.challenges || "Not specified"}
- Budget Range: ${body.budgetRange || "Not specified"}
- Primary Goals: ${body.goals || "Not specified"}`;

    // Call Anthropic API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        temperature: 0.4,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return NextResponse.json(
        { error: "Failed to generate program framework. Please try again." },
        { status: 502 }
      );
    }

    // Stream the response through to the client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "No response body" })}\n\n`));
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
                  continue;
                }
                try {
                  const event = JSON.parse(data) as {
                    type: string;
                    delta?: { type: string; text?: string };
                  };
                  if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`));
                  } else if (event.type === "message_stop") {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
                  }
                } catch {
                  // Skip unparseable lines
                }
              }
            }
          }

          // Process remaining buffer
          if (buffer.startsWith("data: ")) {
            const data = buffer.slice(6);
            if (data !== "[DONE]") {
              try {
                const event = JSON.parse(data) as {
                  type: string;
                  delta?: { type: string; text?: string };
                };
                if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`));
                }
              } catch {
                // Skip
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Stream interrupted" })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    console.log("Program plan streaming for:", body.orgName, body.contactEmail);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Program builder error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
