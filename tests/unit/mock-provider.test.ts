import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createMockProvider, extractRequirementLines, FIXTURES_DIR } from "@/lib/ai/mock-provider";
import { CoverLetterSchema, GapAnalysisSchema, type Tone } from "@/lib/ai/schemas";
import { evidenceFound } from "@/lib/analysis";

type Expected = {
  tone: Tone;
  expectedMissing: { label: string; keywords: string[] }[];
  expectedCovered: { label: string; keywords: string[] }[];
};

const cases = readdirSync(FIXTURES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const read = (caseId: string, file: string) => readFileSync(path.join(FIXTURES_DIR, caseId, file), "utf8");

describe("fixture cases", () => {
  it("has 3-5 fictional test cases", () => {
    expect(cases.length).toBeGreaterThanOrEqual(3);
    expect(cases.length).toBeLessThanOrEqual(5);
  });

  describe.each(cases)("%s", (caseId) => {
    const cv = read(caseId, "cv.txt");
    const gap = GapAnalysisSchema.parse(JSON.parse(read(caseId, "gap-analysis.json")));
    const expected = JSON.parse(read(caseId, "expected.json")) as Expected;

    it("has prewritten responses that match the schemas", () => {
      expect(() => CoverLetterSchema.parse(JSON.parse(read(caseId, "cover-letter.json")))).not.toThrow();
    });

    it("only quotes text that really is in the CV", () => {
      for (const r of gap.requirements) {
        if (r.cvEvidence) expect(evidenceFound(r.cvEvidence, cv), r.cvEvidence).toBe(true);
      }
    });

    it("gives every covered or partial requirement a quote", () => {
      for (const r of gap.requirements.filter((r) => r.status !== "missing")) {
        expect(r.cvEvidence, r.requirement).not.toBeNull();
      }
    });

    it("finds exactly the expected missing qualifications", () => {
      const missing = gap.requirements.filter((r) => r.status === "missing");
      for (const item of expected.expectedMissing) {
        const hit = missing.some((r) => item.keywords.some((k) => r.requirement.toLowerCase().includes(k)));
        expect(hit, `expected "${item.label}" to be missing`).toBe(true);
      }
      expect(missing).toHaveLength(expected.expectedMissing.length);
    });
  });
});

describe("mock provider", () => {
  it("returns the prewritten response for a fixture case", async () => {
    const provider = createMockProvider();
    const input = {
      cvText: read("a-it-support", "cv.txt"),
      posting: read("a-it-support", "posting.txt"),
      keywords: [],
      tone: "formal" as const,
    };
    const gap = await provider.analyzeGap(input);
    expect(gap.requirements.find((r) => r.requirement.includes("ITIL"))?.status).toBe("missing");
    const letter = await provider.writeCoverLetter(input, gap);
    expect(letter.paragraphs[0].text).toContain("Nordvik Kraft");

    // Demo mode can't rewrite a paragraph, and says so.
    const rewritten = await provider.rewriteParagraph(input, gap, letter, 1);
    expect(rewritten.text).toMatch(/^\[Demo\]/);
    expect(rewritten.linkedRequirements).toEqual(letter.paragraphs[1].linkedRequirements);
  });

  it("falls back to labelled keyword matching for other inputs", async () => {
    const provider = createMockProvider();
    const gap = await provider.analyzeGap({
      cvText: "Ola Nordmann\nErfaring med Excel og regnskap\nFørerkort klasse B",
      posting: "Vi søker:\n- Erfaring med Excel\n- Kjennskap til SAP\n- Førerkort klasse B er en fordel",
      keywords: [],
      tone: "formal",
    });
    expect(GapAnalysisSchema.safeParse(gap).success).toBe(true);
    expect(gap.summary).toMatch(/Demo mode/);
    const byText = Object.fromEntries(gap.requirements.map((r) => [r.requirement, r]));
    expect(byText["Erfaring med Excel"].status).not.toBe("missing");
    expect(byText["Kjennskap til SAP"].status).toBe("missing");
    expect(byText["Førerkort klasse B er en fordel"].type).toBe("nice");
  });

  it("finds requirements under headings when bullet characters are missing (copied from a job site)", async () => {
    const posting = [
      "Sommerjobb – Kvalitetsingeniør",
      "Vi er et fiktivt teknologiselskap i Bergen.",
      "Arbeidsoppgaver",
      "Følge opp avvik",
      "Analysere kvalitetsdata",
      "Vi ser etter deg som",
      "Studerer ingeniørfag eller tilsvarende",
      "Har kjennskap til Power BI",
      "Kommuniserer godt på norsk og engelsk",
      "Det er fint om du har",
      "Erfaring med Excel",
      "Søknadsfrist: 1. mai 2027.",
    ].join("\n");

    expect(extractRequirementLines(posting)).toEqual([
      "Studerer ingeniørfag eller tilsvarende",
      "Har kjennskap til Power BI",
      "Kommuniserer godt på norsk og engelsk",
      "Erfaring med Excel",
    ]);

    const gap = await createMockProvider().analyzeGap({
      cvText: "Kari Nordmann\nStuderer ingeniørfag ved et fiktivt universitet\nGod i Excel",
      posting,
      keywords: [],
      tone: "formal",
    });
    expect(gap.requirements).toHaveLength(4);
    expect(gap.requirements.find((r) => r.requirement === "Erfaring med Excel")?.type).toBe("nice");
    expect(gap.requirements.find((r) => r.requirement.startsWith("Studerer"))?.status).not.toBe("missing");
  });

  it("reads the fixture postings by their headings, without tasks or the deadline", () => {
    const lines = extractRequirementLines(read("a-it-support", "posting.txt"));
    expect(lines).toContain("Knowledge of ITIL");
    expect(lines).not.toContain("User support by phone, chat and in person");
    expect(lines.some((line) => line.startsWith("Application deadline"))).toBe(false);
    expect(lines).toHaveLength(9);
  });

  it("extracts bullet and numbered lines from a posting", () => {
    expect(extractRequirementLines("Intro\n- Python\n• SQL\n1. Git\nPlain line")).toEqual(["Python", "SQL", "Git"]);
  });
});
