import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai-prompt";
import { checkRateLimit } from "@/lib/rate-limit";
import { envVar, getDB } from "@/lib/db";

const MODEL = "claude-sonnet-4-6";

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

    // Save the school and its intake first, so the lead is kept even if generation fails.
    const db = getDB();
    const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "") || null;
    const client = await db
      .prepare(
        `INSERT INTO clients (org_name, org_type, board, contact_email)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(contact_email) DO UPDATE SET
           org_name = excluded.org_name,
           org_type = COALESCE(excluded.org_type, clients.org_type),
           board = COALESCE(excluded.board, clients.board)
         RETURNING id`
      )
      .bind(clean(body.orgName, 200), clean(body.orgType, 40), clean(body.board, 40), body.contactEmail.trim().toLowerCase())
      .first<{ id: number }>();
    const intake = await db
      .prepare(
        `INSERT INTO intakes (client_id, enrolment_range, grade_range, identified_range, exceptionalities,
           current_staffing, current_resources, challenges, budget_range, goals)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
      )
      .bind(
        client!.id,
        clean(body.enrolmentRange, 40),
        clean(body.gradeRange, 40),
        clean(body.identifiedRange, 40),
        JSON.stringify(Array.isArray(body.exceptionalities) ? body.exceptionalities.slice(0, 20).map(String) : []),
        clean(body.currentStaffing),
        clean(body.currentResources),
        clean(body.challenges),
        clean(body.budgetRange, 40),
        clean(body.goals)
      )
      .first<{ id: number }>();

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

    const apiKey = envVar("ANTHROPIC_API_KEY");
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    let aiResult: Anthropic.Message;
    try {
      aiResult = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        console.error("Anthropic rate limit:", err.message);
      } else if (err instanceof Anthropic.APIError) {
        console.error(`Anthropic API error ${err.status}:`, err.message);
      } else {
        console.error("Anthropic request failed:", err);
      }
      return NextResponse.json(
        { error: "Failed to generate program framework. Please try again." },
        { status: 502 }
      );
    }

    if (aiResult.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "We couldn't generate a framework for this request. Please contact us and we'll help directly." },
        { status: 502 }
      );
    }
    const planMd = aiResult.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();

    if (!planMd) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    await db
      .prepare("INSERT INTO program_plans (client_id, intake_id, plan_md, model) VALUES (?, ?, ?, ?)")
      .bind(client!.id, intake!.id, planMd, aiResult.model)
      .run();

    return NextResponse.json({
      success: true,
      plan: planMd,
      model: aiResult.model,
    });
  } catch (err) {
    console.error("Program builder error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
