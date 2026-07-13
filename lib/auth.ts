// Authentication: Amazon Cognito for human users (sign-up / login / session)
// plus a DynamoDB-backed API-key store for machine-to-machine access.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  cognito,
  ddb,
  APIKEYS_TABLE,
  COGNITO_CLIENT_ID,
  COGNITO_USER_POOL_ID,
} from "./aws";

const SESSION_COOKIE = "seefood_session";

// ------------------------------------------------------------------ //
// Cognito user auth
// ------------------------------------------------------------------ //

export interface SessionUser {
  sub: string;
  email: string;
  tenantId: string;
}

/** Register a new user + tenant. Returns whether email confirmation is needed. */
export async function signUp(
  email: string,
  password: string,
  tenantId: string,
): Promise<{ userConfirmed: boolean }> {
  const res = await cognito().send(
    new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "custom:tenantId", Value: tenantId },
      ],
    }),
  );
  return { userConfirmed: !!res.UserConfirmed };
}

export async function confirmSignUp(
  email: string,
  code: string,
): Promise<void> {
  await cognito().send(
    new ConfirmSignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    }),
  );
}

export async function resendConfirmation(email: string): Promise<void> {
  await cognito().send(
    new ResendConfirmationCodeCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
    }),
  );
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

/** Authenticate with email + password via USER_PASSWORD_AUTH. */
export async function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const res = await cognito().send(
    new InitiateAuthCommand({
      ClientId: COGNITO_CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }),
  );
  const r = res.AuthenticationResult;
  if (!r?.IdToken || !r.AccessToken) {
    throw new Error("Authentication failed");
  }
  return {
    idToken: r.IdToken,
    accessToken: r.AccessToken,
    refreshToken: r.RefreshToken,
  };
}

// Verifies Cognito ID tokens against the pool's public JWKS. Memoized.
let _verifier: ReturnType<typeof CognitoJwtVerifier.create> | undefined;
function verifier() {
  return (_verifier ??= CognitoJwtVerifier.create({
    userPoolId: COGNITO_USER_POOL_ID,
    tokenUse: "id",
    clientId: COGNITO_CLIENT_ID,
  }));
}

/** Store the ID token in an httpOnly cookie. */
export async function createSession(tokens: AuthTokens): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, tokens.idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1h, matches Cognito ID token validity
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Read + verify the session cookie. Returns null if absent/invalid. */
export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifier().verify(token);
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      tenantId: String(payload["custom:tenantId"] ?? payload.sub),
    };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ //
// API keys (machine-to-machine)
// ------------------------------------------------------------------ //

export interface ApiKeyRecord {
  keyHash: string;
  tenantId: string;
  sub: string;
  label: string;
  createdAt: string;
  revoked: boolean;
  lastUsedAt?: string;
}

const KEY_PREFIX = "sk_live_";

export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a new raw key (shown once) + return its record fields. */
export function generateApiKey(): { raw: string; keyHash: string } {
  const raw = KEY_PREFIX + randomBytes(24).toString("base64url");
  return { raw, keyHash: hashKey(raw) };
}

export async function createApiKey(
  tenantId: string,
  sub: string,
  label: string,
): Promise<{ raw: string; record: ApiKeyRecord }> {
  const { raw, keyHash } = generateApiKey();
  const record: ApiKeyRecord = {
    keyHash,
    tenantId,
    sub,
    label: label.slice(0, 80) || "Untitled key",
    createdAt: new Date().toISOString(),
    revoked: false,
  };
  await ddb().send(new PutCommand({ TableName: APIKEYS_TABLE, Item: record }));
  return { raw, record };
}

export async function listApiKeys(tenantId: string): Promise<ApiKeyRecord[]> {
  const out = await ddb().send(
    new QueryCommand({
      TableName: APIKEYS_TABLE,
      IndexName: "byTenant",
      KeyConditionExpression: "tenantId = :t",
      ExpressionAttributeValues: { ":t": tenantId },
      ScanIndexForward: false,
    }),
  );
  return (out.Items ?? []) as ApiKeyRecord[];
}

export async function revokeApiKey(
  tenantId: string,
  keyHash: string,
): Promise<void> {
  // Guard on tenantId so a user can only revoke their own tenant's keys.
  await ddb().send(
    new UpdateCommand({
      TableName: APIKEYS_TABLE,
      Key: { keyHash },
      ConditionExpression: "tenantId = :t",
      UpdateExpression: "SET revoked = :r",
      ExpressionAttributeValues: { ":t": tenantId, ":r": true },
    }),
  );
}

/**
 * Authorize an API request via EITHER a signed-in session (browser, cookie) OR
 * a Bearer API key (programmatic). Returns tenant context or null if neither.
 */
export async function authorizeRequest(
  req: Request,
): Promise<{ tenantId: string; sub: string } | null> {
  const session = await getSession();
  if (session) return { tenantId: session.tenantId, sub: session.sub };
  return verifyApiKey(req);
}

/** Verify a Bearer API key from a request. Returns tenant context or null. */
export async function verifyApiKey(
  req: Request,
): Promise<{ tenantId: string; sub: string } | null> {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const keyHash = hashKey(match[1].trim());

  const out = await ddb().send(
    new GetCommand({ TableName: APIKEYS_TABLE, Key: { keyHash } }),
  );
  const rec = out.Item as ApiKeyRecord | undefined;
  if (!rec || rec.revoked) return null;

  // Best-effort lastUsedAt touch; don't block the request on it.
  ddb()
    .send(
      new UpdateCommand({
        TableName: APIKEYS_TABLE,
        Key: { keyHash },
        UpdateExpression: "SET lastUsedAt = :now",
        ExpressionAttributeValues: { ":now": new Date().toISOString() },
      }),
    )
    .catch(() => {});

  return { tenantId: rec.tenantId, sub: rec.sub };
}
