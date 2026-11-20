import { NextRequest, NextResponse } from "next/server";
import { DEMO_COOKIE, codesMatch, createDemoToken } from "@/lib/demo-access";

export const runtime = "edge";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const expected = process.env.DEMO_ACCESS_CODE;
  if (!expected) {
    return NextResponse.json({ error: "Demo access is not configured." }, { status: 503 });
  }
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code || !(await codesMatch(code, expected))) {
    return NextResponse.json({ error: "That code did not work." }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_COOKIE, await createDemoToken(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}
