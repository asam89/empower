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
