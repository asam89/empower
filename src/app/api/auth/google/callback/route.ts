import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { exchangeCode, googleConfig, OAUTH_COOKIE, safeNext } from "@/lib/google";
import { resolveUser } from "@/lib/login";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { clientId, clientSecret, redirectUri, base } = googleConfig(request.url);
  const fail = (error: string) => {
    const res = NextResponse.redirect(`${base}/login?error=${error}`);
    res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
    return res;
  };

  if (!clientId || !clientSecret) return fail("not_configured");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return fail("cancelled");

  let saved: { state?: string; verifier?: string; next?: string } = {};
  try {
    saved = JSON.parse(request.cookies.get(OAUTH_COOKIE)?.value ?? "{}");
  } catch {
    /* fall through */
  }
  const code = params.get("code");
  if (!code || !saved.state || !saved.verifier || params.get("state") !== saved.state) {
    return fail("state");
  }

  let userId: number | null;
  try {
    const identity = await exchangeCode(code, saved.verifier, { clientId, clientSecret, redirectUri });
    userId = await resolveUser(identity);
  } catch (err) {
    console.error("Google sign-in failed", err);
    return fail("google");
  }
  if (!userId) return fail("no_access");

  const { token, maxAge } = await createSession(userId);
  const res = NextResponse.redirect(`${base}${safeNext(saved.next)}`);
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
  res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
  return res;
}
