import type { AnalysisInput, CoverLetter, CoverLetterParagraph, GapAnalysis } from "@/lib/ai/schemas";

export interface AiProvider {
  name: "claude" | "mock";
  model: string;
  analyzeGap(input: AnalysisInput): Promise<GapAnalysis>;
  writeCoverLetter(input: AnalysisInput, gap: GapAnalysis): Promise<CoverLetter>;
  /** A new version of one paragraph (by index); the rest of the letter stays as it is. */
  rewriteParagraph(input: AnalysisInput, gap: GapAnalysis, letter: CoverLetter, index: number): Promise<CoverLetterParagraph>;
}
