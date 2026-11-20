import { requireDB } from "@/lib/db";

export async function audit(
  userId: number | null,
  action: string,
  entity?: string,
  entityId?: number | null
): Promise<void> {
  try {
    await requireDB()
      .prepare("INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)")
      .bind(userId, action, entity ?? null, entityId ?? null)
      .run();
  } catch (err) {
    console.error("audit log write failed", err);
  }
}
