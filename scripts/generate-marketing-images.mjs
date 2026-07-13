// Offline marketing-image pipeline (Phase 0.3).
//
// Generates on-brand marketing imagery via the Magnific (Mystic) API, then
// downscales/optimizes to WebP with sharp and writes to public/marketing/.
// Generation is ASYNC: POST returns a task_id we poll until COMPLETED.
//
// Usage:
//   node --env-file=.env.local scripts/generate-marketing-images.mjs [slug...]
//   (no slug = generate all; pass one or more slugs to regenerate a subset)
//
// Requires MAGNIFIC_API_KEY in the environment. Review outputs before committing
// (they cost credits and ship as static assets).
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const API = "https://api.magnific.com/v1/ai/mystic";
const KEY = process.env.MAGNIFIC_API_KEY;
const OUT_DIR = join(process.cwd(), "public", "marketing");

// Brand palette seeded into every generation so imagery stays on-palette.
const BRAND_COLORS = [
  { color: "#1e3a8a", weight: 0.6 }, // navy
  { color: "#4f46e5", weight: 0.4 }, // indigo
];

const STYLE_SUFFIX =
  "Premium enterprise SaaS aesthetic, deep navy and indigo palette, clean, " +
  "minimal, abstract, high-end product marketing, soft studio lighting, no text, " +
  "no logos, no watermarks.";

// Each asset: output slug, aspect ratio, and prompt.
const ASSETS = [
  {
    slug: "hero",
    aspect_ratio: "classic_4_3",
    width: 1200,
    prompt:
      "Abstract visualization of computer vision analyzing food: a single " +
      "gourmet hot dog rendered as elegant 3D geometry, surrounded by faint " +
      "scanning grid lines and floating data points, as if inspected by AI. " +
      STYLE_SUFFIX,
  },
  {
    slug: "feature-deterministic",
    aspect_ratio: "widescreen_16_9",
    width: 800,
    prompt:
      "Abstract concept of a single decisive binary choice: two glowing paths " +
      "converging to one clear answer, minimal geometric shapes, sense of " +
      "certainty and precision. " + STYLE_SUFFIX,
  },
  {
    slug: "feature-explainable",
    aspect_ratio: "widescreen_16_9",
    width: 800,
    prompt:
      "Abstract concept of explainable AI: a transparent glass neural network " +
      "with a soft confidence gauge and annotation lines, clarity and insight. " +
      STYLE_SUFFIX,
  },
  {
    slug: "feature-audit",
    aspect_ratio: "widescreen_16_9",
    width: 800,
    prompt:
      "Abstract concept of an audit trail: neatly stacked translucent record " +
      "cards with timestamps and checkmarks receding into depth, compliance " +
      "and trust. " + STYLE_SUFFIX,
  },
  {
    slug: "og",
    aspect_ratio: "widescreen_16_9",
    width: 1200,
    prompt:
      "Social share banner: abstract AI food-recognition motif, a stylized hot " +
      "dog inside a detection viewfinder, deep navy background with indigo " +
      "accents, generous negative space for overlaid text. " + STYLE_SUFFIX,
  },
];

async function createTask(asset) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-magnific-api-key": KEY },
    body: JSON.stringify({
      prompt: asset.prompt,
      model: "realism",
      resolution: "4k",
      aspect_ratio: asset.aspect_ratio,
      engine: "automatic",
      creative_detailing: 33,
      fixed_generation: true, // reproducible re-runs
      filter_nsfw: true,
      styling: { colors: BRAND_COLORS },
    }),
  });
  if (!res.ok) {
    throw new Error(`create ${asset.slug}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json?.data?.task_id;
}

async function pollTask(taskId) {
  // Poll up to ~5 minutes.
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(`${API}/${taskId}`, {
      headers: { "x-magnific-api-key": KEY },
    });
    if (!res.ok) continue;
    const json = await res.json();
    const status = json?.data?.status;
    const generated = json?.data?.generated ?? [];
    if (status === "COMPLETED" && generated.length) return generated[0];
    if (status === "FAILED" || status === "ERROR") {
      throw new Error(`task ${taskId} failed: ${JSON.stringify(json)}`);
    }
    process.stdout.write(".");
  }
  throw new Error(`task ${taskId} timed out`);
}

async function processAsset(asset) {
  console.log(`\n[${asset.slug}] creating task…`);
  const taskId = await createTask(asset);
  console.log(`[${asset.slug}] task ${taskId}, polling`);
  const url = await pollTask(taskId);
  console.log(`\n[${asset.slug}] downloading ${url}`);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const outPath = join(OUT_DIR, `${asset.slug}.webp`);
  await sharp(buf)
    .resize({ width: asset.width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outPath);
  console.log(`[${asset.slug}] wrote ${outPath}`);
}

async function main() {
  if (!KEY) {
    console.error("MAGNIFIC_API_KEY is required (set it in .env.local).");
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });

  const requested = process.argv.slice(2);
  const assets = requested.length
    ? ASSETS.filter((a) => requested.includes(a.slug))
    : ASSETS;

  if (!assets.length) {
    console.error(`No matching assets. Available: ${ASSETS.map((a) => a.slug).join(", ")}`);
    process.exit(1);
  }

  for (const asset of assets) {
    try {
      await processAsset(asset);
    } catch (e) {
      console.error(`[${asset.slug}] ERROR:`, e.message);
    }
  }
  console.log("\nDone.");
}

main();
