import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const runtime = "edge";

/**
 * Local development only: sign in as any email without Google.
 * Returns 404 in every production build.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }
  const email = (request.nextUrl.searchParams.get("email") ?? "dev-admin@example.com").toLowerCase();
  const role = request.nextUrl.searchParams.get("role") ?? "admin";
  if (!["admin", "teacher", "parent"].includes(role)) {
    return new NextResponse("Bad role", { status: 400 });
  }
  const db = getDB();
  await db
    .prepare("INSERT INTO users (email, name, role) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING")
    .bind(email, email.split("@")[0], role)
    .run();
  const user = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: number }>();
  const { token, maxAge } = await createSession(user!.id);
  const res = NextResponse.redirect(new URL("/portal", request.url));
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
  return res;
}
