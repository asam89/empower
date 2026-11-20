import { envVar } from "@/lib/db";

export const OAUTH_COOKIE = "empower_oauth";

export function googleConfig(requestUrl: string) {
  const clientId = envVar("GOOGLE_CLIENT_ID");
  const clientSecret = envVar("GOOGLE_CLIENT_SECRET");
  const base = (envVar("APP_URL") ?? new URL(requestUrl).origin).replace(/\/+$/, "");
  return { clientId, clientSecret, redirectUri: `${base}/api/auth/google/callback`, base };
}

/** Only allow same-site relative paths as post-login destinations. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/portal";
  }
  return next;
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const part = jwt.split(".")[1];
  if (!part) throw new Error("Malformed id_token");
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/**
 * Exchanges an authorization code for the user's identity. The id_token comes
 * straight from Google's token endpoint over TLS, so per OpenID Connect Core
 * 3.1.3.7 its claims are validated rather than its signature.
 */
export async function exchangeCode(
  code: string,
  verifier: string,
  cfg: { clientId: string; clientSecret: string; redirectUri: string }
): Promise<GoogleIdentity> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.redirectUri,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`);
  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) throw new Error("No id_token returned");

  const claims = decodeJwtPayload(data.id_token);
  const iss = claims.iss;
  if (iss !== "https://accounts.google.com" && iss !== "accounts.google.com") throw new Error("Bad issuer");
  if (claims.aud !== cfg.clientId) throw new Error("Bad audience");
  if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) throw new Error("Token expired");
  if (claims.email_verified !== true || typeof claims.email !== "string") throw new Error("Email not verified");

  return {
    sub: String(claims.sub),
    email: claims.email.toLowerCase(),
    name: typeof claims.name === "string" ? claims.name : undefined,
    picture: typeof claims.picture === "string" ? claims.picture : undefined,
  };
}
