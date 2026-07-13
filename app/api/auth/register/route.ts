import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { signUp } from "@/lib/auth";
import { mapCognitoError } from "@/lib/auth-errors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    // Each new registration starts its own tenant.
    const tenantId = uuidv4();
    const { userConfirmed } = await signUp(
      email.trim().toLowerCase(),
      password,
      tenantId,
    );
    return NextResponse.json({ ok: true, userConfirmed });
  } catch (e) {
    const { status, message } = mapCognitoError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
