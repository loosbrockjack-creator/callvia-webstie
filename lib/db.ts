// Neon Postgres over HTTP. One fetch per query, no connection pool, which is
// what we want under serverless fan-out.
//
// Everything goes through q()/q1(), which take numbered placeholders and an
// array of parameters:
//
//   q("select * from agreements where token_hash = $1", [hash])
//
// Those are real bound parameters, not string interpolation. Never build a
// query by concatenating values into the text.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null = null;

export function db(): NeonQueryFunction<false, false> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add the Neon integration in Vercel, or set it in .env.local.");
  }
  cached = neon(url);
  return cached;
}

// The driver's query() return type is a union over its arrayMode/fullResults
// generics, so it needs one assertion. Doing it here keeps it out of every
// call site. The driver has no schema knowledge, so callers name the row shape
// they expect and are responsible for it matching the SQL.
export async function q<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const rows = await db().query(text, params as unknown[]);
  return rows as T[];
}

export async function q1<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}
