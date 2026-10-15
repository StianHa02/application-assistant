import type { AnalysisInput, CoverLetter, GapAnalysis } from "@/lib/ai/schemas";

export interface AiProvider {
  name: "claude" | "mock";
  model: string;
  analyzeGap(input: AnalysisInput): Promise<GapAnalysis>;
  writeCoverLetter(input: AnalysisInput, gap: GapAnalysis): Promise<CoverLetter>;
}
