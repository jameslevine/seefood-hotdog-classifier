import { describe, it, expect } from "vitest";
import { decodeCursor } from "@/lib/store";

describe("decodeCursor", () => {
  it("round-trips an encoded LastEvaluatedKey", () => {
    const key = { id: "abc", gsi1pk: "CLASSIFICATION", createdAt: "2026-01-01" };
    const encoded = Buffer.from(JSON.stringify(key)).toString("base64url");
    expect(decodeCursor(encoded)).toEqual(key);
  });

  it("returns undefined for null/empty", () => {
    expect(decodeCursor(null)).toBeUndefined();
    expect(decodeCursor("")).toBeUndefined();
    expect(decodeCursor(undefined)).toBeUndefined();
  });

  it("returns undefined for a corrupt cursor instead of throwing", () => {
    expect(decodeCursor("!!!not-base64-json!!!")).toBeUndefined();
  });
});
