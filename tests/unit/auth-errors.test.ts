import { describe, it, expect } from "vitest";
import { mapCognitoError } from "@/lib/auth-errors";

describe("mapCognitoError", () => {
  it("maps duplicate account to 409", () => {
    expect(mapCognitoError({ name: "UsernameExistsException" })).toEqual({
      status: 409,
      message: expect.stringContaining("already exists"),
    });
  });

  it("uses the same generic message for wrong password and unknown user on login", () => {
    const a = mapCognitoError({ name: "NotAuthorizedException" }, "login");
    const b = mapCognitoError({ name: "UserNotFoundException" }, "login");
    expect(a.status).toBe(401);
    expect(a.message).toBe(b.message); // no user-enumeration
  });

  it("treats NotAuthorizedException as a config error on signup, not bad credentials", () => {
    const r = mapCognitoError({ name: "NotAuthorizedException" }, "signup");
    expect(r.status).toBe(403);
    expect(r.message).not.toMatch(/password/i);
  });

  it("maps rate-limit exceptions to 429", () => {
    expect(mapCognitoError({ name: "TooManyRequestsException" }).status).toBe(429);
  });

  it("reads the __type field when name is absent", () => {
    expect(mapCognitoError({ __type: "CodeMismatchException" }).status).toBe(400);
  });

  it("falls back to 500 for unknown errors", () => {
    expect(mapCognitoError(new Error("boom")).status).toBe(500);
  });

  it.each([
    ["InvalidPasswordException", 400],
    ["InvalidParameterException", 400],
    ["ExpiredCodeException", 400],
    ["UserNotConfirmedException", 403],
    ["LimitExceededException", 429],
  ])("maps %s to %i", (name, status) => {
    expect(mapCognitoError({ name }).status).toBe(status);
  });
});
