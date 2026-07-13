import { describe, it, expect } from "vitest";
import { isValidEmail } from "@/lib/leads";

describe("isValidEmail", () => {
  it.each([
    "ada@analytical.io",
    "user.name+tag@sub.example.co.uk",
    "a@b.cd",
  ])("accepts %s", (e) => expect(isValidEmail(e)).toBe(true));

  it.each(["", "no-at-sign", "missing@domain", "@nolocal.com", "spaces in@x.com"])(
    "rejects %s",
    (e) => expect(isValidEmail(e)).toBe(false),
  );
});
