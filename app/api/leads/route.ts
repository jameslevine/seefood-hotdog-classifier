// POST /api/leads — capture a demo/contact-sales lead from the marketing site.
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveLead, isValidEmail, type Lead } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Honeypot: bots fill hidden fields. A present value = spam; silently 200.
    if (typeof body.company_website === "string" && body.company_website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const company = String(body.company ?? "").trim();
    const message = String(body.message ?? "").trim();
    const source = String(body.source ?? "landing").trim().slice(0, 40);

    if (!name || name.length > 120) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid work email." },
        { status: 400 },
      );
    }

    const lead: Lead = {
      id: uuidv4(),
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      company: company.slice(0, 160) || undefined,
      message: message.slice(0, 2000) || undefined,
      source,
      createdAt: new Date().toISOString(),
    };

    await saveLead(lead);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (e) {
    console.error("leads error", e);
    return NextResponse.json(
      { error: "Could not submit. Please try again." },
      { status: 500 },
    );
  }
}
