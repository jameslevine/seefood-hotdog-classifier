// Vision classification via Amazon Bedrock (Anthropic Claude).
// Returns a definitive Hot Dog / Not Hot Dog verdict plus a confidence score
// and a one-sentence rationale, parsed defensively from the model output.
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrock, BEDROCK_MODEL_ID } from "./aws";

export type Verdict = "HOT_DOG" | "NOT_HOT_DOG";

export interface Classification {
  verdict: Verdict;
  confidence: number; // 0-100
  rationale: string;
  modelId: string;
}

const SYSTEM_PROMPT = `You are the classification engine for SeeFood, an enterprise food-recognition platform. Your sole job is binary image classification: is the primary subject of the image a hot dog, or not?

A "hot dog" means a cooked sausage (frankfurter/wiener) served in a sliced bun, or a clearly recognizable frankfurter sausage. Sausages that are not frankfurters, sandwiches, tacos, corn dogs, and hamburgers are NOT hot dogs.

Respond with ONLY a JSON object, no prose, no markdown fences, in exactly this shape:
{"is_hot_dog": <boolean>, "confidence": <integer 0-100>, "rationale": "<one concise sentence explaining the decision>"}

confidence is how sure you are of the stated verdict. Keep the rationale under 20 words and professional in tone.`;

// Bedrock accepts a bounded set of media types for the image block.
const SUPPORTED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export function normalizeMediaType(contentType: string): string {
  const ct = contentType.toLowerCase().split(";")[0].trim();
  if (ct === "image/jpg") return "image/jpeg";
  return ct;
}

export function isSupportedMediaType(contentType: string): boolean {
  return SUPPORTED.has(normalizeMediaType(contentType));
}

/** Pull the first {...} JSON object out of arbitrary model text. */
export function extractJson(text: string): Record<string, unknown> | null {
  const fenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(fenced.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function clampConfidence(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 75;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function classifyImage(
  imageBase64: string,
  mediaType: string,
): Promise<Classification> {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 200,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: normalizeMediaType(mediaType),
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Classify this image. Return only the JSON object.",
          },
        ],
      },
    ],
  };

  const res = await bedrock().send(
    new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    }),
  );

  const decoded = JSON.parse(new TextDecoder().decode(res.body));
  const text: string = decoded?.content?.[0]?.text ?? "";
  const parsed = extractJson(text);

  if (parsed && typeof parsed.is_hot_dog === "boolean") {
    return {
      verdict: parsed.is_hot_dog ? "HOT_DOG" : "NOT_HOT_DOG",
      confidence: clampConfidence(parsed.confidence),
      rationale:
        typeof parsed.rationale === "string" && parsed.rationale.trim()
          ? parsed.rationale.trim()
          : "Classification completed.",
      modelId: BEDROCK_MODEL_ID,
    };
  }

  // Defensive fallback: keyword scan of the raw text.
  const lower = text.toLowerCase();
  const positive = /\b(is|yes)\b[^.]*hot ?dog/.test(lower) || /"is_hot_dog"\s*:\s*true/.test(lower);
  return {
    verdict: positive ? "HOT_DOG" : "NOT_HOT_DOG",
    confidence: 60,
    rationale: "Verdict derived from unstructured model output.",
    modelId: BEDROCK_MODEL_ID,
  };
}
