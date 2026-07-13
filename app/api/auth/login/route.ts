import { NextResponse } from "next/server";
import { login, createSession } from "@/lib/auth";
import { mapCognitoError } from "@/lib/auth-errors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const tokens = await login(email.trim().toLowerCase(), password);
    await createSession(tokens);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const { status, message } = mapCognitoError(e);
    return NextResponse.json({ error: message }, { status });
  }
}
