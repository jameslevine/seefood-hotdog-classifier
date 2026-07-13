import { NextResponse } from "next/server";
import { getSession, revokeApiKey } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { keyHash } = await req.json().catch(() => ({}));
  if (typeof keyHash !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    await revokeApiKey(user.tenantId, keyHash);
    return NextResponse.json({ ok: true });
  } catch {
    // ConditionExpression fails if the key isn't this tenant's.
    return NextResponse.json({ error: "Key not found." }, { status: 404 });
  }
}
