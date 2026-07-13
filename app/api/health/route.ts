import { NextResponse } from "next/server";
import { BEDROCK_MODEL_ID, REGION } from "@/lib/aws";

export const runtime = "nodejs";

// Lightweight liveness/readiness probe. Reports whether the required env is
// present without exposing secret values.
export async function GET() {
  const configured =
    !!(process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
    !!(
      process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
    ) &&
    !!process.env.S3_BUCKET &&
    !!process.env.DDB_TABLE;

  return NextResponse.json({
    status: configured ? "ok" : "degraded",
    service: "seefood-classification-api",
    region: REGION,
    model: BEDROCK_MODEL_ID,
    configured,
    time: new Date().toISOString(),
  });
}
