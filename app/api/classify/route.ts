// POST /api/classify — accepts a multipart image upload, classifies it via
// Bedrock, persists a thumbnail (S3) + metadata (DynamoDB), and returns the
// verdict. The AWS credentials never leave the server.
import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { classifyImage, isSupportedMediaType } from "@/lib/bedrock";
import {
  saveClassification,
  putThumbnail,
  type ClassificationRecord,
} from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const form = await req.formData();
    const file = form.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No image file provided under field 'image'." },
        { status: 400 },
      );
    }

    const contentType = file.type || "application/octet-stream";
    if (!isSupportedMediaType(contentType)) {
      return NextResponse.json(
        {
          error: `Unsupported file type "${contentType}". Please upload a JPEG, PNG, GIF, or WebP image.`,
        },
        { status: 415 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.byteLength === 0) {
      return NextResponse.json({ error: "Empty file." }, { status: 400 });
    }
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 413 },
      );
    }

    // Normalize to a bounded JPEG for both the model payload and the stored
    // thumbnail. This keeps Bedrock latency/cost down and standardizes storage.
    let thumbnail: Buffer;
    let width: number | undefined;
    let height: number | undefined;
    try {
      const img = sharp(bytes, { failOn: "none" }).rotate();
      const meta = await img.metadata();
      width = meta.width;
      height = meta.height;
      thumbnail = await img
        .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 72 })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: "Could not read the image. It may be corrupt." },
        { status: 422 },
      );
    }

    const classification = await classifyImage(
      thumbnail.toString("base64"),
      "image/jpeg",
    );

    const id = uuidv4();
    const imageKey = `thumbnails/${id}.jpg`;
    const latencyMs = Date.now() - startedAt;

    const record: ClassificationRecord = {
      id,
      verdict: classification.verdict,
      confidence: classification.confidence,
      rationale: classification.rationale,
      createdAt: new Date().toISOString(),
      latencyMs,
      modelId: classification.modelId,
      imageKey,
      contentType: "image/jpeg",
      width,
      height,
    };

    // Persist best-effort; a storage hiccup should not deny the user a verdict.
    try {
      await putThumbnail(imageKey, thumbnail, "image/jpeg");
      await saveClassification(record);
    } catch (e) {
      console.error("persistence error", e);
    }

    return NextResponse.json({
      id,
      verdict: classification.verdict,
      confidence: classification.confidence,
      rationale: classification.rationale,
      latencyMs,
      modelId: classification.modelId,
      createdAt: record.createdAt,
    });
  } catch (e) {
    console.error("classify error", e);
    return NextResponse.json(
      { error: "Classification failed. Please try again." },
      { status: 500 },
    );
  }
}
