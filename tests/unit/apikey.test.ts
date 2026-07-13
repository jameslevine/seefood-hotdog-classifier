import { describe, it, expect } from "vitest";
import { hashKey, generateApiKey } from "@/lib/auth";

describe("hashKey", () => {
  it("is deterministic and 64 hex chars (sha256)", () => {
    const h = hashKey("sk_live_abc");
    expect(h).toBe(hashKey("sk_live_abc"));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different inputs", () => {
    expect(hashKey("a")).not.toBe(hashKey("b"));
  });
});

describe("generateApiKey", () => {
  it("produces a prefixed raw key whose hash matches hashKey(raw)", () => {
    const { raw, keyHash } = generateApiKey();
    expect(raw.startsWith("sk_live_")).toBe(true);
    expect(keyHash).toBe(hashKey(raw));
  });

  it("produces unique keys", () => {
    expect(generateApiKey().raw).not.toBe(generateApiKey().raw);
  });
});
