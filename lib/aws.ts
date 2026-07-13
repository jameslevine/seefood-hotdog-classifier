// Shared AWS client construction. Credentials come explicitly from env vars so
// local dev and Vercel behave identically (and never fall back to an ambient
// AWS_PROFILE). All clients are created lazily and memoized per module load.
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

export const REGION = process.env.AWS_REGION || "eu-west-2";
export const DDB_TABLE = process.env.DDB_TABLE || "hotdog-classifications";
export const S3_BUCKET = process.env.S3_BUCKET || "";
export const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ||
  "eu.anthropic.claude-haiku-4-5-20251001-v1:0";

function credentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  // If explicit keys are present, use them; otherwise let the SDK use its
  // default provider chain (useful for IAM roles in other environments).
  if (accessKeyId && secretAccessKey) {
    return {
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    };
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
