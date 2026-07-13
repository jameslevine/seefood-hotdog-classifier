import { describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { vi } from "vitest";

// Presigner is network-touching; stub it to a deterministic string so the
// store's URL-signing path is exercised without real AWS.
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(async () => "https://signed.example/thumb.jpg"),
}));

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

// Import after mocks are set up.
const { listClassifications, computeStats, saveClassification, putThumbnail } =
  await import("@/lib/store");

const REC = (id: string, verdict: "HOT_DOG" | "NOT_HOT_DOG") => ({
  id,
  verdict,
  confidence: 90,
  rationale: "test",
  createdAt: `2026-01-0${id}T00:00:00.000Z`,
  latencyMs: 1000,
  modelId: "m",
  imageKey: `thumbnails/${id}.jpg`,
  gsi1pk: "CLASSIFICATION",
});

beforeEach(() => {
  ddbMock.reset();
  s3Mock.reset();
});

describe("saveClassification", () => {
  it("stamps the constant gsi1pk so the record lands in the GSI", async () => {
    ddbMock.on(PutCommand).resolves({});
    await saveClassification({
      id: "x",
      verdict: "HOT_DOG",
      confidence: 90,
      rationale: "r",
      createdAt: "2026-01-01T00:00:00.000Z",
      latencyMs: 100,
      modelId: "m",
    });
    const call = ddbMock.commandCalls(PutCommand)[0];
    expect(call.args[0].input.Item?.gsi1pk).toBe("CLASSIFICATION");
  });
});

describe("putThumbnail", () => {
  it("puts the object with the given key and content type", async () => {
    s3Mock.on(PutObjectCommand).resolves({});
    await putThumbnail("thumbnails/x.jpg", Buffer.from("img"), "image/jpeg");
    const call = s3Mock.commandCalls(PutObjectCommand)[0];
    expect(call.args[0].input.Key).toBe("thumbnails/x.jpg");
    expect(call.args[0].input.ContentType).toBe("image/jpeg");
  });
});

describe("listClassifications", () => {
  it("queries the GSI newest-first and attaches presigned thumbnail URLs", async () => {
    // First Query = page of records; subsequent Query(s) = stats pass.
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [REC("2", "HOT_DOG"), REC("1", "NOT_HOT_DOG")],
        LastEvaluatedKey: { id: "1" },
      })
      .resolves({
        Items: [REC("2", "HOT_DOG"), REC("1", "NOT_HOT_DOG")],
      });

    const page = await listClassifications(2);

    expect(page.records).toHaveLength(2);
    expect(page.records[0].thumbnailUrl).toBe("https://signed.example/thumb.jpg");
    expect(page.nextCursor).toBeTypeOf("string"); // LastEvaluatedKey → cursor
    expect(page.stats.total).toBe(2);
    expect(page.stats.hotDogs).toBe(1);
    expect(page.stats.hotDogRate).toBeCloseTo(0.5);

    // Assert we used Query (GSI), never Scan.
    const calls = ddbMock.commandCalls(QueryCommand);
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0].args[0].input.IndexName).toBe("byCreatedAt");
    expect(calls[0].args[0].input.ScanIndexForward).toBe(false);
  });

  it("returns null cursor when there are no more rows", async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [REC("1", "HOT_DOG")] });
    const page = await listClassifications(50);
    expect(page.nextCursor).toBeNull();
  });

  it("omits the thumbnail URL for records without an imageKey", async () => {
    const noImage = { ...REC("1", "HOT_DOG"), imageKey: undefined };
    ddbMock.on(QueryCommand).resolves({ Items: [noImage] });
    const page = await listClassifications(50);
    expect(page.records[0].thumbnailUrl).toBeUndefined();
  });

  it("handles an empty table (no items) with zeroed stats", async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    const page = await listClassifications(50);
    expect(page.records).toHaveLength(0);
    expect(page.stats.total).toBe(0);
    expect(page.stats.hotDogRate).toBe(0);
    expect(page.stats.avgConfidence).toBe(0);
    expect(page.nextCursor).toBeNull();
  });

  it("tolerates a Query response with no Items field", async () => {
    ddbMock.on(QueryCommand).resolves({}); // no Items key at all
    const page = await listClassifications(50);
    expect(page.records).toHaveLength(0);
    expect(page.stats.total).toBe(0);
  });
});

describe("computeStats", () => {
  it("aggregates across paginated Query results", async () => {
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [REC("3", "HOT_DOG")],
        LastEvaluatedKey: { id: "3" },
      })
      .resolvesOnce({
        Items: [REC("2", "HOT_DOG"), REC("1", "NOT_HOT_DOG")],
      });

    const stats = await computeStats();
    expect(stats.total).toBe(3);
    expect(stats.hotDogs).toBe(2);
    expect(stats.notHotDogs).toBe(1);
  });

  it("treats missing confidence/latency as zero", async () => {
    const partial = {
      id: "1",
      verdict: "HOT_DOG",
      createdAt: "2026-01-01T00:00:00.000Z",
      gsi1pk: "CLASSIFICATION",
    };
    ddbMock.on(QueryCommand).resolves({ Items: [partial] });
    const stats = await computeStats();
    expect(stats.total).toBe(1);
    expect(stats.avgConfidence).toBe(0);
    expect(stats.avgLatencyMs).toBe(0);
  });
});
