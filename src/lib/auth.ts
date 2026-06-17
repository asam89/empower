import { cookies } from "next/headers";

const SESSION_COOKIE = "empower_admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

function getSigningSecret(): string {
  return `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}:empower-session`;
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    console.error(
      "ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set."
    );
    return false;
  }

  return username === expectedUser && password === expectedPass;
}

export async function createSession(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${expiresAt}`;
  const sig = await hmacSign(payload, getSigningSecret());
  return `${payload}.${sig}`;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) return false;

  const payload = token.substring(0, dotIdx);
  const sig = token.substring(dotIdx + 1);

  const expectedSig = await hmacSign(payload, getSigningSecret());
  if (sig !== expectedSig) return false;

  const expiresAt = parseInt(payload, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export { SESSION_COOKIE };
