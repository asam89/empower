import type { D1Database } from "@cloudflare/workers-types";

// Tables never written to a backup: SQLite/Cloudflare internals, and sign-in
// sessions (a restored session token must never grant access).
const EXCLUDED = new Set(["d1_migrations", "sessions", "sqlite_sequence"]);
const isExcluded = (name: string) => EXCLUDED.has(name) || name.startsWith("_cf_") || name.startsWith("sqlite_");

export interface TableCount {
  name: string;
  rows: number;
}

async function listTables(db: D1Database): Promise<string[]> {
  const { results } = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all<{ name: string }>();
  return results.map((r) => r.name).filter((n) => !isExcluded(n));
}

const ident = (name: string) => `"${name.replace(/"/g, '""')}"`;

function literal(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : new Uint8Array(value.buffer);
    return `X'${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

export async function tableCounts(db: D1Database): Promise<TableCount[]> {
  const tables = await listTables(db);
  if (tables.length === 0) return [];
  const results = await db.batch(tables.map((t) => db.prepare(`SELECT COUNT(*) AS n FROM ${ident(t)}`)));
  return tables.map((name, i) => ({ name, rows: Number((results[i].results[0] as { n: number }).n) }));
}

/**
 * A data-only SQL dump of every application table. Restore it into a database
 * that already has the migrations applied (see README → Backups).
 */
export async function buildSqlDump(db: D1Database, generatedBy: string): Promise<{ sql: string; counts: TableCount[] }> {
  const tables = await listTables(db);
  const lines: string[] = [
    "-- Empower database backup (data only)",
    `-- Generated ${new Date().toISOString()} by ${generatedBy.replace(/[\r\n]/g, " ")}`,
    "-- Restore into a database with all migrations applied. Sign-in sessions are not included.",
    "PRAGMA defer_foreign_keys = TRUE;",
    "",
  ];
  const counts: TableCount[] = [];
  for (const table of tables) {
    const { results } = await db.prepare(`SELECT * FROM ${ident(table)}`).all<Record<string, unknown>>();
    counts.push({ name: table, rows: results.length });
    lines.push(`-- ${table}: ${results.length} row${results.length === 1 ? "" : "s"}`);
    lines.push(`DELETE FROM ${ident(table)};`);
    for (const row of results) {
      const cols = Object.keys(row);
      lines.push(
        `INSERT INTO ${ident(table)} (${cols.map(ident).join(", ")}) VALUES (${cols.map((c) => literal(row[c])).join(", ")});`
      );
    }
    lines.push("");
  }
  return { sql: lines.join("\n"), counts };
}
