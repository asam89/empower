import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdminPasswordAuthenticated } from "@/lib/admin-password";
import { getDB } from "@/lib/db";
import { audit } from "@/lib/audit";
import { buildSqlDump } from "@/lib/backup";

export const runtime = "edge";

/** Downloads a data-only SQL backup of the database. Admins only. */
export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json({ error: "No database is configured." }, { status: 503 });

  const user = await getCurrentUser();
  const isPortalAdmin = user?.role === "admin";
  if (!isPortalAdmin && !(await isAdminPasswordAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sql } = await buildSqlDump(db, isPortalAdmin ? user!.email : "admin (password login)");
  await audit(isPortalAdmin ? user!.id : null, "backup.download");

  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, "").replace("T", "-");
  return new NextResponse(sql, {
    headers: {
      "Content-Type": "application/sql; charset=utf-8",
      "Content-Disposition": `attachment; filename="empower-backup-${stamp}.sql"`,
      "Cache-Control": "no-store",
    },
  });
}
