import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDB } from "@/lib/db";

export const SESSION_COOKIE = "empower_session";
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type Role = "admin" | "teacher" | "parent";

export interface User {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
  role: Role;
}

export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return base64url(buf);
}

export function base64url(buf: Uint8Array): string {
  let s = "";
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sha256(input: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return new Uint8Array(digest);
}

async function hashToken(token: string): Promise<string> {
  return Array.from(await sha256(token), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Creates a session row and returns the raw token to store in the cookie. */
export async function createSession(userId: number): Promise<{ token: string; maxAge: number }> {
  const token = randomToken();
  const db = getDB();
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await hashToken(token), userId, Date.now() + SESSION_DURATION_MS)
    .run();
  // Opportunistic cleanup of expired sessions
  await db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(Date.now()).run();
  return { token, maxAge: SESSION_DURATION_MS / 1000 };
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await getDB().prepare("DELETE FROM sessions WHERE id = ?").bind(await hashToken(token)).run();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await getDB()
    .prepare(
      `SELECT u.id, u.email, u.name, u.picture, u.role
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = ? AND s.expires_at > ? AND u.disabled = 0`
    )
    .bind(await hashToken(token), Date.now())
    .first<User>();
  return row ?? null;
}

/** For server components and actions: redirects to /login when signed out. */
export async function requireUser(roles?: Role[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/portal?error=forbidden");
  return user;
}

export const isStaff = (user: User) => user.role === "admin" || user.role === "teacher";

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
