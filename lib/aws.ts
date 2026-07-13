// Shared AWS client construction. Credentials come explicitly from env vars so
// local dev and Vercel behave identically (and never fall back to an ambient
// AWS_PROFILE). All clients are created lazily and memoized per module load.
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

export const REGION =
  process.env.APP_AWS_REGION || process.env.AWS_REGION || "eu-west-2";
export const DDB_TABLE = process.env.DDB_TABLE || "hotdog-classifications";
export const S3_BUCKET = process.env.S3_BUCKET || "";
export const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ||
  "eu.anthropic.claude-haiku-4-5-20251001-v1:0";

function credentials() {
  // Vercel reserves the AWS_* env names, so on Vercel we set APP_AWS_* instead.
  // Prefer those; fall back to the standard names for local dev; and if neither
  // is set, let the SDK use its default provider chain (IAM roles, profiles).
  const accessKeyId =
    process.env.APP_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.APP_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken =
    process.env.APP_AWS_SESSION_TOKEN || process.env.AWS_SESSION_TOKEN;
  if (accessKeyId && secretAccessKey) {
    return { credentials: { accessKeyId, secretAccessKey, sessionToken } };
  }
  return {};
}

let _bedrock: BedrockRuntimeClient | undefined;
export function bedrock(): BedrockRuntimeClient {
  return (_bedrock ??= new BedrockRuntimeClient({
    region: REGION,
    ...credentials(),
  }));
}

let _ddb: DynamoDBDocumentClient | undefined;
export function ddb(): DynamoDBDocumentClient {
  if (!_ddb) {
    const base = new DynamoDBClient({ region: REGION, ...credentials() });
    _ddb = DynamoDBDocumentClient.from(base, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return _ddb;
}

let _s3: S3Client | undefined;
export function s3(): S3Client {
  return (_s3 ??= new S3Client({ region: REGION, ...credentials() }));
}
