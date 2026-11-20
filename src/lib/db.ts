import type { D1Database } from "@cloudflare/workers-types";

// Same global that @cloudflare/next-on-pages' getOptionalRequestContext() reads; importing that
// package would pull @cloudflare/workers-types in globally and retype fetch/Response app-wide.
const REQUEST_CONTEXT = Symbol.for("__cloudflare-request-context__");

// Returns null outside Cloudflare (next dev, Docker), where there is no D1 binding.
export function getDB(): D1Database | null {
  const ctx = (globalThis as Record<symbol, { env?: Record<string, unknown> } | undefined>)[REQUEST_CONTEXT];
  const db = (ctx?.env?.DB ?? (process.env as Record<string, unknown>).DB) as D1Database | undefined;
  return db ?? null;
}

/** For code that cannot work without the database (the portal). */
export function requireDB(): D1Database {
  const db = getDB();
  if (!db) throw new Error("D1 database binding (DB) is not available");
  return db;
}

/** Reads a Cloudflare secret/variable for this request (falls back to process.env). */
export function envVar(name: string): string | undefined {
  const ctx = (globalThis as Record<symbol, { env?: Record<string, unknown> } | undefined>)[REQUEST_CONTEXT];
  const value = ctx?.env?.[name] ?? process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
