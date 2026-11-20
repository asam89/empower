import { NextRequest, NextResponse } from "next/server";
import { base64url, randomToken, sha256 } from "@/lib/auth";
import { googleConfig, OAUTH_COOKIE, safeNext } from "@/lib/google";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { clientId, redirectUri, base } = googleConfig(request.url);
  if (!clientId) {
    return NextResponse.redirect(`${base}/login?error=not_configured`);
  }

  const state = randomToken(16);
  const verifier = randomToken(32);
  const challenge = base64url(await sha256(verifier));
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(url.toString());
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, verifier, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });
  return res;
}
