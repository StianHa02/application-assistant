import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

import { AiError } from "@/lib/ai/errors";
import {
  COVER_LETTER_SYSTEM,
  coverLetterUserPrompt,
  GAP_ANALYSIS_SYSTEM,
  gapAnalysisUserPrompt,
} from "@/lib/ai/prompts";
import { CoverLetterSchema, GapAnalysisSchema } from "@/lib/ai/schemas";
import type { AiProvider } from "@/lib/ai/types";

// The only file that talks to the Anthropic API.

export const DEFAULT_MODEL = "claude-haiku-5-5";

export function createClaudeProvider(
  apiKey: string,
  model = DEFAULT_MODEL,
  // Only used by tests, to replace the network with a fake response.
  options: { fetch?: typeof fetch; maxRetries?: number } = {},
): AiProvider {
  const client = new Anthropic({ apiKey, ...options });

  async function call<T extends z.ZodType>(system: string, user: string, schema: T): Promise<z.infer<T>> {
    let response;
    try {
      // create() (not parse()) so stop_reason can be checked before the JSON is parsed:
      // a refusal or cut-off answer is not valid JSON and should get its own error message.
      response = await client.messages.create({
        model,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium", format: zodOutputFormat(schema) },
        system,
        messages: [{ role: "user", content: user }],
      });
    } catch (error) {
      throw toAiError(error);
    }

    if (response.stop_reason === "refusal") {
      throw new AiError("refusal", "The model declined to process this request.");
    }
    if (response.stop_reason === "max_tokens") {
      throw new AiError("too_long", "The response was cut off because it was too long.");
    }

    const text = response.content.find((block) => block.type === "text")?.text ?? "";
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new AiError("invalid_output", "The model did not return valid JSON.");
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new AiError("invalid_output", "The model's answer did not match the expected structure.");
    }
    return parsed.data;
  }

  return {
    name: "claude",
    model,
    analyzeGap: (input) => call(GAP_ANALYSIS_SYSTEM, gapAnalysisUserPrompt(input), GapAnalysisSchema),
    writeCoverLetter: (input, gap) =>
      call(COVER_LETTER_SYSTEM, coverLetterUserPrompt(input, gap), CoverLetterSchema),
  };
}

function toAiError(error: unknown): AiError {
  // Most specific first. Never log CV content - only the error type and status.
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return new AiError("auth", "The Anthropic API key was rejected.");
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AiError("rate_limit", "Too many requests to the AI service.");
  }
  if (error instanceof Anthropic.BadRequestError && /credit/i.test(error.message)) {
    return new AiError("credit", "The Anthropic account has no remaining credit.");
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new AiError("network", "Could not reach the AI service.");
  }
  if (error instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${error.status}`);
    return new AiError("unknown", `AI service error (${error.status}).`);
  }
  console.error("Unexpected AI error", error instanceof Error ? error.name : typeof error);
  return new AiError("unknown", "Unexpected error while calling the AI service.");
}
