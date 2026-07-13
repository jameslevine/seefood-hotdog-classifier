import { describe, it, expect } from "vitest";
import {
  extractJson,
  clampConfidence,
  normalizeMediaType,
  isSupportedMediaType,
} from "@/lib/bedrock";

describe("extractJson", () => {
  it("parses a bare JSON object", () => {
    expect(extractJson('{"is_hot_dog":true,"confidence":90}')).toEqual({
      is_hot_dog: true,
      confidence: 90,
    });
  });

  it("strips markdown fences", () => {
    const text = '```json\n{"is_hot_dog":false,"confidence":80}\n```';
    expect(extractJson(text)).toEqual({ is_hot_dog: false, confidence: 80 });
  });

  it("extracts an object embedded in prose", () => {
    const text = 'Sure! Here is the result: {"is_hot_dog":true} — enjoy.';
    expect(extractJson(text)).toEqual({ is_hot_dog: true });
  });

  it("returns null for non-JSON text", () => {
    expect(extractJson("no json here")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(extractJson('{"is_hot_dog": tru')).toBeNull();
  });
});

describe("clampConfidence", () => {
  it("passes valid numbers through, rounded", () => {
    expect(clampConfidence(87.6)).toBe(88);
  });
  it("clamps above 100 and below 0", () => {
    expect(clampConfidence(150)).toBe(100);
    expect(clampConfidence(-5)).toBe(0);
  });
  it("coerces numeric strings", () => {
    expect(clampConfidence("73")).toBe(73);
  });
  it("defaults to 75 for non-numeric input", () => {
    expect(clampConfidence("abc")).toBe(75);
    expect(clampConfidence(undefined)).toBe(75);
    expect(clampConfidence(NaN)).toBe(75);
  });
});

describe("normalizeMediaType", () => {
  it("maps image/jpg to image/jpeg", () => {
    expect(normalizeMediaType("image/jpg")).toBe("image/jpeg");
  });
  it("lowercases and strips parameters", () => {
    expect(normalizeMediaType("IMAGE/PNG; charset=binary")).toBe("image/png");
  });
});

describe("isSupportedMediaType", () => {
  it.each(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"])(
    "accepts %s",
    (t) => expect(isSupportedMediaType(t)).toBe(true),
  );
  it.each(["text/plain", "application/pdf", "image/tiff"])(
    "rejects %s",
    (t) => expect(isSupportedMediaType(t)).toBe(false),
  );
});
