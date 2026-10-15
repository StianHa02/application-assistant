import type { AiErrorCode } from "@/lib/ai/errors";
import type { CvParseErrorCode } from "@/lib/parse-cv";

// User-facing error messages for the codes returned by Server Actions.

export const UPLOAD_ERRORS: Record<CvParseErrorCode | "postingShort" | "postingLong", string> = {
  no_file: "Choose a CV file.",
  too_large: "The file is too large. Max 5 MB.",
  unsupported_type: "File type not supported. Use PDF or TXT.",
  unreadable: "We couldn't read the PDF. Try saving it again, or use TXT.",
  empty: "Found almost no text in the file. Is it a scanned PDF? Try a PDF with text, or TXT.",
  postingShort: "Paste the whole job posting (at least 50 characters).",
  postingLong: "The posting is too long (max 20,000 characters).",
};

export const AI_ERRORS: Record<AiErrorCode, string> = {
  auth: "The API key was rejected. Check ANTHROPIC_API_KEY in .env.",
  rate_limit: "Too many requests right now. Wait a moment and try again.",
  credit: "The Anthropic account is out of credit.",
  network: "Couldn't reach the AI service. Check your internet connection.",
  refusal: "The AI declined to process this request.",
  too_long: "The response was too long and was cut off. Try a shorter posting.",
  invalid_output: "The AI returned a response that couldn't be read. Try again.",
  unknown: "Something went wrong with the AI service. Try again.",
};
