// Signed cookie for the /demo access code. Same HMAC approach as the admin
// session; changing DEMO_ACCESS_CODE revokes every existing cookie.

export const DEMO_COOKIE = "empower_demo";
export const DEMO_ACCESS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function signingSecret(code: string): string {
  return `${code}:empower-demo-access`;
}

/** Compare two codes without leaking where they differ. */
export async function codesMatch(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([hmac(given, "empower-demo-compare"), hmac(expected, "empower-demo-compare")]);
  return a === b;
}

export async function createDemoToken(code: string, now = Date.now()): Promise<string> {
  const expiresAt = String(now + DEMO_ACCESS_DURATION_MS);
  return `${expiresAt}.${await hmac(expiresAt, signingSecret(code))}`;
}

export async function verifyDemoToken(token: string, code: string, now = Date.now()): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || now > expiresAt) return false;
  return sig === (await hmac(payload, signingSecret(code)));
}
