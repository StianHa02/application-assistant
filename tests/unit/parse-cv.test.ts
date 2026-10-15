import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { findFixtureCase } from "@/lib/ai/mock-provider";
import { CvParseError, MAX_CV_BYTES, parseCv } from "@/lib/parse-cv";

const CASES = path.join(process.cwd(), "fixtures", "cases");

function fileFrom(name: string, bytes: Uint8Array | string, type: string) {
  const data = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  return {
    name,
    type,
    size: data.byteLength,
    arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
  };
}

describe("parseCv", () => {
  it.each(["a-it-support-nb", "b-data-analyst-en", "c-markedsforing-nb"])(
    "extracts text from the %s PDF (incl. two-column layout) and recognises the fixture",
    async (caseId) => {
      const pdf = readFileSync(path.join(CASES, caseId, "cv.pdf"));
      const text = await parseCv(fileFrom("cv.pdf", new Uint8Array(pdf), "application/pdf"));
      const posting = readFileSync(path.join(CASES, caseId, "posting.txt"), "utf8");

      expect(text.length).toBeGreaterThan(200);
      expect(findFixtureCase({ cvText: text, posting })?.id).toBe(caseId);
    },
  );

  it("reads TXT files", async () => {
    const txt = readFileSync(path.join(CASES, "a-it-support-nb", "cv.txt"), "utf8");
    const text = await parseCv(fileFrom("cv.txt", txt, "text/plain"));
    expect(text).toContain("Ingrid Solberg");
  });

  it("rejects unsupported file types", async () => {
    await expect(parseCv(fileFrom("cv.docx", "hello", "application/vnd.openxmlformats"))).rejects.toMatchObject({
      code: "unsupported_type",
    });
  });

  it("rejects files over the size limit", async () => {
    const big = { ...fileFrom("cv.txt", "x", "text/plain"), size: MAX_CV_BYTES + 1 };
    await expect(parseCv(big)).rejects.toBeInstanceOf(CvParseError);
    await expect(parseCv(big)).rejects.toMatchObject({ code: "too_large" });
  });

  it("rejects files with (almost) no text, like scanned PDFs", async () => {
    await expect(parseCv(fileFrom("cv.txt", "Ola", "text/plain"))).rejects.toMatchObject({ code: "empty" });
  });

  it("rejects corrupt PDFs", async () => {
    await expect(parseCv(fileFrom("cv.pdf", "not really a pdf", "application/pdf"))).rejects.toMatchObject({
      code: "unreadable",
    });
  });
});
