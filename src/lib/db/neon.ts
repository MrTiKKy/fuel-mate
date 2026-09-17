import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon Postgres client (server-only).
 * Tables/schema are managed in the Neon SQL editor — no ORM required.
 *
 * Local IndexedDB remains in `src/lib/db/index.ts` for the current offline app.
 */
let sql: NeonQueryFunction<false, false> | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Add it to `.env.local` (and Vercel env for production).",
    );
  }

  if (!sql) {
    sql = neon(url);
  }

  return sql;
}

export async function pingDatabase(): Promise<{ ok: true; result: number }> {
  const db = getSql();
  const rows = await db`select 1::int as ok`;
  return { ok: true, result: rows[0]?.ok ?? 0 };
}
