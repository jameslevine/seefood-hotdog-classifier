import { describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);
const { saveLead } = await import("@/lib/leads");

beforeEach(() => ddbMock.reset());

describe("saveLead", () => {
  it("writes the lead to the leads table", async () => {
    ddbMock.on(PutCommand).resolves({});
    await saveLead({
      id: "lead-1",
      name: "Ada",
      email: "ada@x.io",
      company: "Analytical",
      source: "contact",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    const call = ddbMock.commandCalls(PutCommand)[0];
    expect(call.args[0].input.Item?.email).toBe("ada@x.io");
    expect(call.args[0].input.Item?.source).toBe("contact");
  });
});
