import { extractText, getDocumentProxy } from "unpdf";

// Turns an uploaded CV into plain text. Only the text is kept; the original file is discarded.

export const MAX_CV_BYTES = 5 * 1024 * 1024;
const MIN_TEXT_LENGTH = 50;

export type CvParseErrorCode = "no_file" | "too_large" | "unsupported_type" | "unreadable" | "empty";

export class CvParseError extends Error {
  constructor(public readonly code: CvParseErrorCode) {
    super(code);
    this.name = "CvParseError";
  }
}

function fileKind(name: string, type: string): "pdf" | "txt" | null {
  const lower = name.toLowerCase();
  if (type === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (type === "text/plain" || lower.endsWith(".txt")) return "txt";
  return null;
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function parseCv(file: { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> }): Promise<string> {
  if (!file || file.size === 0) throw new CvParseError("no_file");
  if (file.size > MAX_CV_BYTES) throw new CvParseError("too_large");

  const kind = fileKind(file.name, file.type);
  if (!kind) throw new CvParseError("unsupported_type");

  const bytes = new Uint8Array(await file.arrayBuffer());
  let text: string;

  if (kind === "txt") {
    text = new TextDecoder("utf-8").decode(bytes);
  } else {
    try {
      const pdf = await getDocumentProxy(bytes);
      const result = await extractText(pdf, { mergePages: true });
      text = result.text;
    } catch {
      throw new CvParseError("unreadable");
    }
  }

  const cleaned = cleanText(text);
  // Scanned PDFs (images) have no text layer.
  if (cleaned.length < MIN_TEXT_LENGTH) throw new CvParseError("empty");
  return cleaned;
}
