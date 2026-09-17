import { requireUserId } from "@/auth";
import { getUserSnapshot } from "@/lib/cloud/user-data";

/** Full cloud snapshot for the authenticated user only. */
export async function GET() {
  try {
    const userId = await requireUserId();
    const snapshot = await getUserSnapshot(userId);
    return Response.json({ ok: true, snapshot });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 },
    );
  }
}
