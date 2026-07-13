// GET  /api/keys — list the signed-in tenant's API keys.
// POST /api/keys — mint a new key (raw value returned once).
import { NextResponse } from "next/server";
import { getSession, listApiKeys, createApiKey } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const keys = await listApiKeys(user.tenantId);
  // keyHash is a SHA-256 of the (already discarded) raw key, not the secret
  // itself; returning it to the authenticated owner is safe and lets the UI
  // revoke. The raw key is never recoverable.
  return NextResponse.json({
    keys: keys.map((k) => ({
      keyHash: k.keyHash,
      label: k.label,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt ?? null,
      revoked: k.revoked,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const label = typeof body.label === "string" ? body.label : "Untitled key";
  const { raw, record } = await createApiKey(user.tenantId, user.sub, label);
  return NextResponse.json({
    raw, // shown once
    key: { label: record.label, createdAt: record.createdAt },
  });
}
