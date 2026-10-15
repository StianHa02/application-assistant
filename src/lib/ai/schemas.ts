import { z } from "zod";

// The structured output the AI must return. The same schemas validate real Claude responses,
// the prewritten demo files in fixtures/, and the test data.

export const RequirementSchema = z.object({
  requirement: z.string().describe("The requirement as stated or clearly implied by the job posting."),
  type: z.enum(["must", "nice"]).describe("must = required qualification, nice = advantage / nice to have."),
  status: z.enum(["covered", "partial", "missing"]),
  cvEvidence: z
    .string()
    .nullable()
    .describe("A word-for-word quote from the CV that supports the status, or null if there is none."),
  reasoning: z.string().describe("Why this status was given, referring to the evidence."),
  nextStep: z.string().describe("A concrete action the student can take for this requirement."),
});

export const PhrasingSuggestionSchema = z.object({
  original: z.string().describe("Wording from the CV (quote)."),
  suggested: z.string().describe("Improved wording that uses the posting's language without inventing facts."),
  why: z.string().describe("Which part of the posting this addresses and why it is more relevant."),
});

export const GapAnalysisSchema = z.object({
  summary: z.string().describe("Two to three sentences on how well the CV matches the posting overall."),
  requirements: z.array(RequirementSchema),
  atsRelevance: z.object({
    summary: z
      .string()
      .describe("How an applicant tracking system would likely read this CV against this posting."),
    phrasingSuggestions: z.array(PhrasingSuggestionSchema),
  }),
});

export const CoverLetterParagraphSchema = z.object({
  text: z.string(),
  rationale: z.string().describe("Why the paragraph is written this way."),
  linkedRequirements: z.array(z.string()).describe("Requirements (from the gap analysis) this paragraph targets."),
});

export const CoverLetterSchema = z.object({
  paragraphs: z.array(CoverLetterParagraphSchema),
});

export type Requirement = z.infer<typeof RequirementSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
export type CoverLetter = z.infer<typeof CoverLetterSchema>;

export type Language = "nb" | "en";
export type Tone = "formal" | "conversational";

export type AnalysisInput = {
  cvText: string;
  posting: string;
  keywords: string[];
  language: Language;
  tone: Tone;
};
