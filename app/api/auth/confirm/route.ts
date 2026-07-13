import { NextResponse } from "next/server";
import { confirmSignUp } from "@/lib/auth";
import { mapCognitoError } from "@/lib/auth-errors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (typeof email !== "string" || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    await confirmSignUp(email.trim().toLowerCase(), code.trim());
    return NextResponse.json({ ok: true });
  } catch (e) {
    const { status, message } = mapCognitoError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
