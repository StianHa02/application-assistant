export type AiErrorCode = "auth" | "rate_limit" | "credit" | "network" | "refusal" | "too_long" | "invalid_output" | "unknown";

// Thrown by AI providers. The code maps to a translated, user-facing message.
export class AiError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AiError";
  }
}
