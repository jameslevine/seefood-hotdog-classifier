import { describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  type InvokeModelCommandOutput,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockMock = mockClient(BedrockRuntimeClient);
const { classifyImage } = await import("@/lib/bedrock");

// Build a Bedrock InvokeModel response body wrapping Claude's text output.
// The SDK types `body` as a Uint8Array blob adapter; the store only decodes the
// bytes, so we cast the encoded payload to the expected shape for the mock.
function modelReply(text: string) {
  const payload = JSON.stringify({ content: [{ type: "text", text }] });
  const bytes = new TextEncoder().encode(payload);
  return {
    body: bytes as unknown as InvokeModelCommandOutput["body"],
    contentType: "application/json",
  };
}

beforeEach(() => bedrockMock.reset());

describe("classifyImage", () => {
  it("parses a structured HOT_DOG verdict", async () => {
    bedrockMock
      .on(InvokeModelCommand)
      .resolves(
        modelReply(
          '{"is_hot_dog":true,"confidence":95,"rationale":"A frankfurter in a bun."}',
        ),
      );

    const result = await classifyImage("base64data", "image/jpeg");
    expect(result.verdict).toBe("HOT_DOG");
    expect(result.confidence).toBe(95);
    expect(result.rationale).toContain("frankfurter");
  });

  it("parses a NOT_HOT_DOG verdict and clamps confidence", async () => {
    bedrockMock
      .on(InvokeModelCommand)
      .resolves(
        modelReply('{"is_hot_dog":false,"confidence":140,"rationale":"A pizza."}'),
      );

    const result = await classifyImage("base64data", "image/png");
    expect(result.verdict).toBe("NOT_HOT_DOG");
    expect(result.confidence).toBe(100); // clamped
  });

  it("falls back to a keyword scan when JSON is unstructured", async () => {
    bedrockMock
      .on(InvokeModelCommand)
      .resolves(modelReply("Yes, this is clearly a hot dog on a plate."));

    const result = await classifyImage("base64data", "image/jpeg");
    expect(result.verdict).toBe("HOT_DOG");
    expect(result.confidence).toBe(60); // fallback confidence
  });

  it("supplies a default rationale when the model omits one", async () => {
    bedrockMock
      .on(InvokeModelCommand)
      .resolves(modelReply('{"is_hot_dog":true,"confidence":88}'));
    const result = await classifyImage("base64data", "image/jpeg");
    expect(result.verdict).toBe("HOT_DOG");
    expect(result.rationale).toBeTruthy(); // fell back to a default string
  });

  it("sends the request to the configured model id", async () => {
    bedrockMock.on(InvokeModelCommand).resolves(modelReply('{"is_hot_dog":true}'));
    await classifyImage("base64data", "image/jpeg");
    const call = bedrockMock.commandCalls(InvokeModelCommand)[0];
    expect(call.args[0].input.modelId).toContain("claude");
  });
});
