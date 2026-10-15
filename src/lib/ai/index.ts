import "server-only";

import { createClaudeProvider, DEFAULT_MODEL } from "@/lib/ai/claude-provider";
import { createMockProvider } from "@/lib/ai/mock-provider";
import type { AiProvider } from "@/lib/ai/types";

export { AiError } from "@/lib/ai/errors";
export { PROMPT_VERSION } from "@/lib/ai/prompts";

/**
 * Picks the AI provider:
 * - AI_MODE=mock               -> demo mode (prewritten fixture responses / keyword matching)
 * - ANTHROPIC_API_KEY is set   -> Claude (CLAUDE_MODEL, default claude-haiku-5-5)
 * - otherwise                  -> demo mode
 */
export function getAiProvider(): AiProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (process.env.AI_MODE === "mock" || !apiKey) return createMockProvider();
  return createClaudeProvider(apiKey, process.env.CLAUDE_MODEL?.trim() || DEFAULT_MODEL);
}

export function isDemoMode(): boolean {
  return getAiProvider().name === "mock";
}
