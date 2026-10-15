// Runs the REAL model on every fixture case and checks that the gap analysis finds the expected
// missing qualifications (fixtures/cases/<case>/expected.json). Needs ANTHROPIC_API_KEY.
// Cost: roughly $0.002 per case with claude-haiku-5-5.
//
// Run: npm run eval            (all cases)
//      npm run eval -- a-it    (only cases whose folder name contains "a-it")

import "dotenv/config";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { createClaudeProvider, DEFAULT_MODEL } from "../src/lib/ai/claude-provider";
import type { Language, Tone } from "../src/lib/ai/schemas";
import { computeCoverage, evidenceFound } from "../src/lib/analysis";

type Expected = {
  language: Language;
  tone: Tone;
  expectedMissing: { label: string; keywords: string[] }[];
  expectedCovered: { label: string; keywords: string[] }[];
};

const CASES_DIR = path.join(process.cwd(), "fixtures", "cases");

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set in .env. The eval calls the real model, so it needs a key (see SETUP.md).");
    process.exit(1);
  }
  const model = process.env.CLAUDE_MODEL?.trim() || DEFAULT_MODEL;
  const provider = createClaudeProvider(apiKey, model);
  const filter = process.argv[2] ?? "";

  const cases = readdirSync(CASES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.includes(filter))
    .map((entry) => entry.name);

  console.log(`Evaluating ${cases.length} case(s) with ${model}\n`);
  let passed = 0;
  let checks = 0;

  for (const caseId of cases) {
    const read = (file: string) => readFileSync(path.join(CASES_DIR, caseId, file), "utf8");
    const expected = JSON.parse(read("expected.json")) as Expected;
    const cvText = read("cv.txt");
    const started = Date.now();
    const gap = await provider.analyzeGap({
      cvText,
      posting: read("posting.txt"),
      keywords: [],
      language: expected.language,
      tone: expected.tone,
    });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    const coverage = computeCoverage(gap.requirements);
    console.log(`■ ${caseId}  (${seconds}s, ${gap.requirements.length} requirements, score ${coverage.score}%)`);

    const find = (keywords: string[]) =>
      gap.requirements.find((r) => keywords.some((k) => r.requirement.toLowerCase().includes(k)));

    for (const item of expected.expectedMissing) {
      const r = find(item.keywords);
      const ok = r?.status === "missing";
      checks++;
      if (ok) passed++;
      console.log(`  ${ok ? "✓" : "✗"} missing: ${item.label}${r ? ` → ${r.status}` : " → not found"}`);
    }
    for (const item of expected.expectedCovered) {
      const r = find(item.keywords);
      const ok = r?.status === "covered";
      checks++;
      if (ok) passed++;
      console.log(`  ${ok ? "✓" : "✗"} covered: ${item.label}${r ? ` → ${r.status}` : " → not found"}`);
    }

    const quotes = gap.requirements.filter((r) => r.cvEvidence);
    const badQuotes = quotes.filter((r) => !evidenceFound(r.cvEvidence, cvText));
    checks++;
    if (badQuotes.length === 0) passed++;
    console.log(`  ${badQuotes.length === 0 ? "✓" : "✗"} quotes found in CV: ${quotes.length - badQuotes.length}/${quotes.length}`);
    for (const r of badQuotes) console.log(`      not in CV: "${r.cvEvidence}"`);
    console.log();
  }

  console.log(`Result: ${passed}/${checks} checks passed`);
  process.exit(passed === checks ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : error);
  process.exit(1);
});
