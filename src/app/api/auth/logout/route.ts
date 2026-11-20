import { NextRequest, NextResponse } from "next/server";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  await destroySession(request.cookies.get(SESSION_COOKIE)?.value);
  const res = NextResponse.redirect(new URL("/login?signed_out=1", request.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
