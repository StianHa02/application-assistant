import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createClaudeProvider } from "@/lib/ai/claude-provider";
import { AiError } from "@/lib/ai/errors";
import type { AnalysisInput } from "@/lib/ai/schemas";

// Tests the Claude provider without network or API key: a fake fetch returns canned API responses.

const CASE = path.join(process.cwd(), "fixtures", "cases", "a-it-support-nb");
const input: AnalysisInput = {
  cvText: readFileSync(path.join(CASE, "cv.txt"), "utf8"),
  posting: readFileSync(path.join(CASE, "posting.txt"), "utf8"),
  keywords: ["Python"],
  language: "nb",
  tone: "formal",
};
const gapJson = readFileSync(path.join(CASE, "gap-analysis.json"), "utf8");

function fakeApi(status: number, body: unknown) {
  const requests: Record<string, unknown>[] = [];
  const fetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
    requests.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  };
  return { fetch: fetch as typeof globalThis.fetch, requests };
}

const message = (text: string, stopReason = "end_turn") => ({
  id: "msg_test",
  type: "message",
  role: "assistant",
  model: "claude-haiku-5-5",
  content: [{ type: "text", text }],
  stop_reason: stopReason,
  stop_sequence: null,
  usage: { input_tokens: 1000, output_tokens: 500 },
});

describe("Claude provider", () => {
  it("sends the prompt with a JSON schema and parses the structured answer", async () => {
    const api = fakeApi(200, message(gapJson));
    const provider = createClaudeProvider("test-key", "claude-haiku-5-5", { fetch: api.fetch, maxRetries: 0 });

    const gap = await provider.analyzeGap(input);

    expect(gap.requirements).toHaveLength(9);
    const request = api.requests[0] as {
      model: string;
      thinking: { type: string };
      output_config: { effort: string; format: { type: string; schema: { properties: Record<string, unknown> } } };
      system: string;
      messages: { content: string }[];
    };
    expect(request.model).toBe("claude-haiku-5-5");
    expect(request.thinking).toEqual({ type: "adaptive" });
    expect(request.output_config.effort).toBe("medium");
    expect(request.output_config.format.type).toBe("json_schema");
    expect(Object.keys(request.output_config.format.schema.properties)).toEqual(["summary", "requirements", "atsRelevance"]);
    expect(request.system).toContain("word for word");
    expect(request.messages[0].content).toContain("<cv>");
    expect(request.messages[0].content).toContain("Norwegian");
    expect(request.messages[0].content).toContain("Python");
  });

  it("turns a refusal into an AiError", async () => {
    const api = fakeApi(200, message("", "refusal"));
    const provider = createClaudeProvider("test-key", undefined, { fetch: api.fetch, maxRetries: 0 });
    await expect(provider.analyzeGap(input)).rejects.toMatchObject({ code: "refusal" });
  });

  it("turns a cut-off answer into an AiError", async () => {
    const api = fakeApi(200, message('{"summary": "abc', "max_tokens"));
    const provider = createClaudeProvider("test-key", undefined, { fetch: api.fetch, maxRetries: 0 });
    await expect(provider.analyzeGap(input)).rejects.toMatchObject({ code: "too_long" });
  });

  it("reports a wrong API key as an auth error", async () => {
    const api = fakeApi(401, { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } });
    const provider = createClaudeProvider("bad-key", undefined, { fetch: api.fetch, maxRetries: 0 });
    const error = await provider.analyzeGap(input).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AiError);
    expect(error).toMatchObject({ code: "auth" });
  });

  it("writes cover-letter suggestions with the gap analysis as context", async () => {
    const letter = readFileSync(path.join(CASE, "cover-letter.json"), "utf8");
    const api = fakeApi(200, message(letter));
    const provider = createClaudeProvider("test-key", undefined, { fetch: api.fetch, maxRetries: 0 });
    const result = await provider.writeCoverLetter(input, JSON.parse(gapJson));
    expect(result.paragraphs).toHaveLength(4);
    expect((api.requests[0] as { messages: { content: string }[] }).messages[0].content).toContain("<gap_analysis>");
  });
});

describe("Claude provider output validation", () => {
  it("rejects JSON that does not match the schema", async () => {
    const api = fakeApi(200, message(JSON.stringify({ summary: "x", requirements: [{ requirement: "SQL" }] })));
    const provider = createClaudeProvider("test-key", undefined, { fetch: api.fetch, maxRetries: 0 });
    await expect(provider.analyzeGap(input)).rejects.toMatchObject({ code: "invalid_output" });
  });
});
