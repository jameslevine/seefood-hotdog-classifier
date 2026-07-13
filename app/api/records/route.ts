// GET /api/records — recent classifications + aggregate stats for the
// audit-log dashboard. Presigned thumbnail URLs are generated server-side.
import { NextResponse } from "next/server";
import { listClassifications } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      200,
      Math.max(1, Number(searchParams.get("limit")) || 50),
    );
    const page = await listClassifications(limit);
    return NextResponse.json(page);
  } catch (e) {
    console.error("records error", e);
    return NextResponse.json(
      { error: "Could not load classification records." },
      { status: 500 },
    );
  }
}
