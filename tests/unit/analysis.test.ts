import { describe, expect, it } from "vitest";

import type { Requirement } from "@/lib/ai/schemas";
import { computeCoverage, evidenceFound } from "@/lib/analysis";

const req = (type: Requirement["type"], status: Requirement["status"]): Requirement => ({
  requirement: "x",
  type,
  status,
  cvEvidence: null,
  reasoning: "",
  nextStep: "",
});

describe("computeCoverage", () => {
  it("counts statuses and must-haves", () => {
    const coverage = computeCoverage([req("must", "covered"), req("must", "missing"), req("nice", "partial")]);
    expect(coverage).toMatchObject({ total: 3, covered: 1, partial: 1, missing: 1, mustTotal: 2, mustCovered: 1 });
  });

  it("weights must-haves double and partial as half", () => {
    // (1*2 + 0*2 + 0.5*1) / (2 + 2 + 1) = 2.5 / 5 = 50 %
    expect(computeCoverage([req("must", "covered"), req("must", "missing"), req("nice", "partial")]).score).toBe(50);
  });

  it("is 100 when everything is covered and 0 for an empty list", () => {
    expect(computeCoverage([req("must", "covered"), req("nice", "covered")]).score).toBe(100);
    expect(computeCoverage([]).score).toBe(0);
  });
});

describe("evidenceFound", () => {
  const cv = "ERFARING\n- Hjalp kunder med oppsett av ruter\n  og feilsøking av wifi\nFERDIGHETER\nPython, SQL";

  it("finds exact quotes across line breaks and different whitespace", () => {
    expect(evidenceFound("Hjalp kunder med oppsett av ruter og feilsøking av wifi", cv)).toBe(true);
  });

  it("ignores case, surrounding quotes and a trailing full stop", () => {
    expect(evidenceFound("«python, sql».", cv)).toBe(true);
  });

  it("accepts quotes shortened with an ellipsis", () => {
    expect(evidenceFound("Hjalp kunder ... feilsøking av wifi", cv)).toBe(true);
  });

  it("rejects quotes that are not in the CV", () => {
    expect(evidenceFound("Fem års erfaring med Azure", cv)).toBe(false);
    expect(evidenceFound(null, cv)).toBe(false);
  });
});
