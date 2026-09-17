import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db/neon";

/**
 * Quick connectivity check: GET /api/db/health
 * Uses DATABASE_URL from env (local `.env.local` or Vercel).
 */
export async function GET() {
  try {
    const ping = await pingDatabase();
    return NextResponse.json({
      status: "ok",
      database: "neon",
      ping: ping.result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "neon",
        message:
          error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 500 },
    );
  }
}
