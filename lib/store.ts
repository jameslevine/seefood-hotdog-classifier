// Persistence for classification records: DynamoDB for metadata, S3 for
// downscaled thumbnails, with server-generated presigned URLs for display.
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ddb, s3, DDB_TABLE, S3_BUCKET } from "./aws";
import type { Verdict } from "./bedrock";

// Constant partition key for the byCreatedAt GSI: every record shares it so
// createdAt orders the whole set. (If per-tenant scoping is added, switch this
// to `TENANT#<id>` to shard by tenant.)
export const GSI_PK = "CLASSIFICATION";
const GSI_NAME = "byCreatedAt";

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
  gsi1pk?: string; // constant, powers the byCreatedAt index
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
  await ddb().send(
    new PutCommand({
      TableName: DDB_TABLE,
      Item: { ...record, gsi1pk: GSI_PK },
    }),
  );
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

export interface Stats {
  total: number;
  hotDogs: number;
  notHotDogs: number;
  hotDogRate: number; // 0-1
  avgConfidence: number; // 0-100
  avgLatencyMs: number;
}

export interface RecordsPage {
  records: (ClassificationRecord & { thumbnailUrl?: string })[];
  stats: Stats;
  /** Opaque cursor for the next page, or null when there are no more rows. */
  nextCursor: string | null;
}

// The DynamoDB LastEvaluatedKey is a small object; we base64-encode it into an
// opaque cursor string for the API/UI to round-trip.
function encodeCursor(key: Record<string, unknown> | undefined): string | null {
  if (!key) return null;
  return Buffer.from(JSON.stringify(key)).toString("base64url");
}

export function decodeCursor(
  cursor?: string | null,
): Record<string, unknown> | undefined {
  if (!cursor) return undefined;
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return undefined;
  }
}

/**
 * Aggregate stats across ALL records, computed by paging the GSI. At demo/
 * moderate scale this is fine; the documented next step for large tables is a
 * maintained counter item updated on write instead of recomputing.
 */
export async function computeStats(): Promise<Stats> {
  let total = 0;
  let hotDogs = 0;
  let confidenceSum = 0;
  let latencySum = 0;
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const out = await ddb().send(
      new QueryCommand({
        TableName: DDB_TABLE,
        IndexName: GSI_NAME,
        KeyConditionExpression: "gsi1pk = :pk",
        ExpressionAttributeValues: { ":pk": GSI_PK },
        ProjectionExpression: "verdict, confidence, latencyMs",
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );
    for (const item of (out.Items ?? []) as ClassificationRecord[]) {
      total += 1;
      if (item.verdict === "HOT_DOG") hotDogs += 1;
      confidenceSum += item.confidence || 0;
      latencySum += item.latencyMs || 0;
    }
    exclusiveStartKey = out.LastEvaluatedKey;
  } while (exclusiveStartKey);

  const notHotDogs = total - hotDogs;
  return {
    total,
    hotDogs,
    notHotDogs,
    hotDogRate: total ? hotDogs / total : 0,
    avgConfidence: total ? Math.round(confidenceSum / total) : 0,
    avgLatencyMs: total ? Math.round(latencySum / total) : 0,
  };
}

/**
 * Query the byCreatedAt GSI for the most recent `limit` records (newest first),
 * attach presigned thumbnail URLs, and return a cursor for the next page.
 * Aggregate stats are computed separately over all rows.
 */
export async function listClassifications(
  limit = 50,
  cursor?: string | null,
): Promise<RecordsPage> {
  const out = await ddb().send(
    new QueryCommand({
      TableName: DDB_TABLE,
      IndexName: GSI_NAME,
      KeyConditionExpression: "gsi1pk = :pk",
      ExpressionAttributeValues: { ":pk": GSI_PK },
      ScanIndexForward: false, // newest first
      Limit: limit,
      ExclusiveStartKey: decodeCursor(cursor),
    }),
  );

  const items = (out.Items ?? []) as ClassificationRecord[];
  const records = await Promise.all(
    items.map(async (r) => ({
      ...r,
      thumbnailUrl: r.imageKey ? await thumbnailUrl(r.imageKey) : undefined,
    })),
  );

  const stats = await computeStats();

  return { records, stats, nextCursor: encodeCursor(out.LastEvaluatedKey) };
}
