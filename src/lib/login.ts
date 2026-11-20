import { requireDB, envVar } from "@/lib/db";
import type { GoogleIdentity } from "@/lib/google";
import { audit } from "@/lib/audit";

/**
 * Resolves a verified Google identity to a portal user. Access is invite-only:
 * the email must already exist in `users` (added by an admin or teacher), or be
 * listed in the ADMIN_EMAILS setting for bootstrapping the first admins.
 */
export async function resolveUser(identity: GoogleIdentity): Promise<number | null> {
  const db = requireDB();

  const bySub = await db
    .prepare("SELECT id, disabled FROM users WHERE google_sub = ?")
    .bind(identity.sub)
    .first<{ id: number; disabled: number }>();
  if (bySub?.disabled) return null;

  let userId = bySub?.id ?? null;

  if (!userId) {
    const byEmail = await db
      .prepare("SELECT id, google_sub, disabled FROM users WHERE email = ?")
      .bind(identity.email)
      .first<{ id: number; google_sub: string | null; disabled: number }>();
    if (byEmail) {
      if (byEmail.disabled) return null;
      // Email is already bound to a different Google account: refuse.
      if (byEmail.google_sub && byEmail.google_sub !== identity.sub) return null;
      userId = byEmail.id;
    }
  }

  if (!userId) {
    const admins = (envVar("ADMIN_EMAILS") ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!admins.includes(identity.email)) return null;
    const created = await db
      .prepare("INSERT INTO users (email, role) VALUES (?, 'admin') RETURNING id")
      .bind(identity.email)
      .first<{ id: number }>();
    userId = created!.id;
  }

  await db
    .prepare(
      `UPDATE users SET google_sub = ?, name = COALESCE(?, name), picture = ?,
              last_login_at = datetime('now') WHERE id = ?`
    )
    .bind(identity.sub, identity.name ?? null, identity.picture ?? null, userId)
    .run();
  await audit(userId, "login", "user", userId);
  return userId;
}
