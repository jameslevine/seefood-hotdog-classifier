// Persistence for classification records: DynamoDB for metadata, S3 for
// downscaled thumbnails, with server-generated presigned URLs for display.
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ddb, s3, DDB_TABLE, S3_BUCKET } from "./aws";
import type { Verdict } from "./bedrock";

export interface ClassificationRecord {
  id: string;
  verdict: Verdict;
  confidence: number;
  rationale: string;
  createdAt: string; // ISO
  latencyMs: number;
  modelId: string;
  imageKey?: string;
  contentType?: string;
  width?: number;
  height?: number;
}

export async function putThumbnail(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function saveClassification(
  record: ClassificationRecord,
): Promise<void> {
  await ddb().send(new PutCommand({ TableName: DDB_TABLE, Item: record }));
}

/** Presigned GET URL for a thumbnail, valid for the given seconds. */
export async function thumbnailUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    { expiresIn },
  );
}

export interface RecordsPage {
  records: (ClassificationRecord & { thumbnailUrl?: string })[];
  stats: {
    total: number;
    hotDogs: number;
    notHotDogs: number;
    hotDogRate: number; // 0-1
    avgConfidence: number; // 0-100
    avgLatencyMs: number;
  };
}

/**
 * Scan the table, sort by createdAt desc, attach presigned thumbnail URLs to
 * the most recent `limit` records, and compute aggregate stats over ALL rows.
 * Scan is acceptable at demo scale; see README for the production path (GSI).
 */
export async function listClassifications(limit = 50): Promise<RecordsPage> {
  const out = await ddb().send(new ScanCommand({ TableName: DDB_TABLE }));
  const all = (out.Items ?? []) as ClassificationRecord[];
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = all.length;
  const hotDogs = all.filter((r) => r.verdict === "HOT_DOG").length;
  const notHotDogs = total - hotDogs;
  const avgConfidence = total
    ? all.reduce((s, r) => s + (r.confidence || 0), 0) / total
    : 0;
  const avgLatencyMs = total
    ? all.reduce((s, r) => s + (r.latencyMs || 0), 0) / total
    : 0;

  const top = all.slice(0, limit);
  const records = await Promise.all(
    top.map(async (r) => ({
      ...r,
      thumbnailUrl: r.imageKey ? await thumbnailUrl(r.imageKey) : undefined,
    })),
  );

  return {
    records,
    stats: {
      total,
      hotDogs,
      notHotDogs,
      hotDogRate: total ? hotDogs / total : 0,
      avgConfidence: Math.round(avgConfidence),
      avgLatencyMs: Math.round(avgLatencyMs),
    },
  };
}
