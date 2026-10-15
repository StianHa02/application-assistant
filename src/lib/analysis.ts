import type { GapAnalysis, Requirement } from "@/lib/ai/schemas";

// Deterministic post-processing of AI output. Done in code, not by the model, so it is testable.

export type Coverage = {
  total: number;
  covered: number;
  partial: number;
  missing: number;
  mustTotal: number;
  mustCovered: number;
  /** 0-100. Must-haves count double; partial counts half. */
  score: number;
};

const STATUS_POINTS = { covered: 1, partial: 0.5, missing: 0 } as const;
const TYPE_WEIGHT = { must: 2, nice: 1 } as const;

export function computeCoverage(requirements: Requirement[]): Coverage {
  let weighted = 0;
  let maxWeighted = 0;
  const coverage = { total: requirements.length, covered: 0, partial: 0, missing: 0, mustTotal: 0, mustCovered: 0 };

  for (const r of requirements) {
    coverage[r.status] += 1;
    if (r.type === "must") {
      coverage.mustTotal += 1;
      if (r.status === "covered") coverage.mustCovered += 1;
    }
    weighted += STATUS_POINTS[r.status] * TYPE_WEIGHT[r.type];
    maxWeighted += TYPE_WEIGHT[r.type];
  }

  return { ...coverage, score: maxWeighted === 0 ? 0 : Math.round((weighted / maxWeighted) * 100) };
}

/** Lowercase, unify quotes/dashes and collapse whitespace so PDF line breaks don't break matching. */
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’“”"'«»]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[•·▪●]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True if the quote really appears in the CV. Catches evidence the model made up. */
export function evidenceFound(quote: string | null, cvText: string): boolean {
  if (!quote) return false;
  // Allow quotes that were shortened with "..." by checking each part separately.
  const parts = quote
    .split(/\.\.\.|…/)
    .map((part) => normalizeForMatch(part).replace(/^[.,;:\s-]+|[.,;:\s]+$/g, ""))
    .filter((part) => part.length > 0);
  if (parts.length === 0) return false;
  const cv = normalizeForMatch(cvText);
  return parts.every((part) => cv.includes(part));
}

export type CheckedRequirement = Requirement & { evidenceVerified: boolean };

export function checkEvidence(gap: GapAnalysis, cvText: string): CheckedRequirement[] {
  return gap.requirements.map((r) => ({
    ...r,
    evidenceVerified: r.cvEvidence === null ? true : evidenceFound(r.cvEvidence, cvText),
  }));
}
