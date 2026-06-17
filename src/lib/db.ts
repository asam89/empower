import type { D1Database } from "@cloudflare/workers-types";

export function getDB(): D1Database {
  const env = (process.env as Record<string, unknown>);
  const db = env.DB as D1Database | undefined;
  if (!db) {
    throw new Error("D1 database binding (DB) is not available");
  }
  return db;
}
