import { getRequestContext } from "@cloudflare/next-on-pages";
import type { D1Database } from "@cloudflare/workers-types";

type Env = Record<string, unknown> & { DB?: D1Database };

/** Cloudflare bindings and secrets (falls back to process.env outside a request). */
export function getEnv(): Env {
  try {
    return { ...(process.env as Env), ...(getRequestContext().env as Env) };
  } catch {
    return process.env as Env;
  }
}

export function envVar(name: string): string | undefined {
  const value = getEnv()[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getDB(): D1Database {
  const db = getEnv().DB;
  if (!db) {
    throw new Error("D1 database binding (DB) is not available");
  }
  return db;
}
