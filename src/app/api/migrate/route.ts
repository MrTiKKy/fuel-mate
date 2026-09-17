import { requireUserId } from "@/auth";
import {
  getUserCloudSummary,
  migrateLocalDumpToNeon,
} from "@/lib/migrate/run-migration";
import { migratePayloadSchema } from "@/lib/migrate/schema";

export async function GET() {
  try {
    const userId = await requireUserId();
    const summary = await getUserCloudSummary(userId);
    return Response.json({ ok: true, summary });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const json = await request.json();
    const parsed = migratePayloadSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid migrate payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await migrateLocalDumpToNeon(userId, parsed.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 },
    );
  }
}
