import { cookies } from "next/headers";

const SESSION_COOKIE = "empower_admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const sessions = new Map<string, { expiresAt: number }>();

function generateId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
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
  const id = generateId();
  sessions.set(id, { expiresAt: Date.now() + SESSION_DURATION_MS });
  return id;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return false;

  const session = sessions.get(sessionId);
  if (!session) return false;

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return false;
  }

  return true;
}

export { SESSION_COOKIE };
