import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { relativeTime, absoluteTime } from "@/lib/format";

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("formats seconds", () => {
    expect(relativeTime("2026-01-01T11:59:30.000Z")).toBe("30s ago");
  });
  it("formats minutes", () => {
    expect(relativeTime("2026-01-01T11:30:00.000Z")).toBe("30m ago");
  });
  it("formats hours", () => {
    expect(relativeTime("2026-01-01T09:00:00.000Z")).toBe("3h ago");
  });
  it("formats days", () => {
    expect(relativeTime("2025-12-29T12:00:00.000Z")).toBe("3d ago");
  });
  it("clamps future timestamps to 0s", () => {
    expect(relativeTime("2026-01-01T12:00:30.000Z")).toBe("0s ago");
  });
});

describe("absoluteTime", () => {
  it("produces a human-readable string", () => {
    expect(absoluteTime("2026-01-01T12:00:00.000Z")).toMatch(/2026/);
  });
});
