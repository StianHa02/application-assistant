import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { normalizeForMatch } from "@/lib/analysis";
import {
  type AnalysisInput,
  type CoverLetter,
  CoverLetterSchema,
  type GapAnalysis,
  GapAnalysisSchema,
  type Requirement,
} from "@/lib/ai/schemas";
import type { AiProvider } from "@/lib/ai/types";

// Demo mode, used when no ANTHROPIC_API_KEY is set (or AI_MODE=mock).
//
// 1. If the CV + posting match one of the fictional test cases in fixtures/cases/, the prewritten
//    response files for that case are returned (gap-analysis.json and cover-letter.json).
// 2. Otherwise a simple keyword-matching analysis is built from the actual input. It is clearly
//    labelled as demo output, and shows how old-fashioned keyword ATS screening works.

export const FIXTURES_DIR = path.join(process.cwd(), "fixtures", "cases");

const DEMO_DELAY_MS = Number(process.env.DEMO_DELAY_MS ?? 600);

/**
 * Hash used to recognise a fixture case. Built from the sorted set of words, so it is robust to
 * whitespace, PDF line breaks and two-column layouts that change the reading order.
 */
export function fixtureKey(cvText: string, posting: string): string {
  const words = (s: string) =>
    Array.from(new Set(normalizeForMatch(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean)))
      .sort()
      .join(" ");
  return createHash("sha256").update(`${words(cvText)}|${words(posting)}`).digest("hex");
}

type FixtureCase = { id: string; dir: string; key: string };

function loadFixtureCases(): FixtureCase[] {
  if (!existsSync(FIXTURES_DIR)) return [];
  return readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(FIXTURES_DIR, entry.name);
      const cv = readFileSync(path.join(dir, "cv.txt"), "utf8");
      const posting = readFileSync(path.join(dir, "posting.txt"), "utf8");
      return { id: entry.name, dir, key: fixtureKey(cv, posting) };
    });
}

export function findFixtureCase(input: Pick<AnalysisInput, "cvText" | "posting">): FixtureCase | undefined {
  const key = fixtureKey(input.cvText, input.posting);
  return loadFixtureCases().find((c) => c.key === key);
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createMockProvider(): AiProvider {
  return {
    name: "mock",
    model: "demo",

    async analyzeGap(input) {
      await wait(DEMO_DELAY_MS);
      const fixture = findFixtureCase(input);
      if (fixture) return GapAnalysisSchema.parse(readJson(path.join(fixture.dir, "gap-analysis.json")));
      return keywordGapAnalysis(input);
    },

    async writeCoverLetter(input, gap) {
      await wait(DEMO_DELAY_MS);
      const fixture = findFixtureCase(input);
      if (fixture) return CoverLetterSchema.parse(readJson(path.join(fixture.dir, "cover-letter.json")));
      return templateCoverLetter(input, gap);
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Keyword-matching fallback for inputs that are not fixture cases.

const STOPWORDS = new Set(
  (
    "og i på til for med som av er en et det den de du vi har kan skal vil må eller om fra ved " +
    "the and or of to in for with a an is are be you we our your have has will can must on at as by"
  ).split(" "),
);

const NICE_HINTS = /(fint om|ønskelig|en fordel|fordel om|nice to have|is a plus|an advantage|preferred|bonus)/i;

const BULLET = /^([-*•–▪●]|\d+[.)])\s+/;
// Section headings that introduce requirements, and headings that end such a section.
const REQUIREMENT_HEADING =
  /^(vi ser etter|hvem er du|kvalifikasjon|krav|vi ønsker|ønskelig|det er (en )?fint|det er en fordel|fint om|ferdigheter|personlige egenskaper|requirements|qualifications|who you are|we are looking|nice to have|skills)/i;
const OTHER_HEADING =
  /^(arbeidsoppgaver|oppgaver|ansvar|vi tilbyr|om oss|om stillingen|om selskapet|søknadsfrist|kontakt|what you will do|responsibilities|tasks|we offer|about us|how to apply)/i;
// Lines that end a requirement section even when they are not headings (e.g. "Søknadsfrist: 1. mai.").
const SECTION_END = /^(søknadsfrist|for mer informasjon|kontakt|spørsmål|application deadline|deadline|for more information|contact)/i;
const MAX_REQUIREMENTS = 12;

const isHeading = (line: string) => line.length <= 60 && !BULLET.test(line) && !/[.!?]$/.test(line);

/**
 * Requirement-like lines in a posting. First looks for lines under requirement headings
 * ("Vi ser etter deg som", "Requirements", ...), which also works for postings copied from job
 * sites where the bullet characters are lost. Falls back to all bullet lines.
 */
export function extractRequirementLines(posting: string): string[] {
  const lines = posting
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const strip = (line: string) => line.replace(BULLET, "").trim();

  const fromSections: string[] = [];
  let inSection = false;
  for (const line of lines) {
    if (isHeading(line) && REQUIREMENT_HEADING.test(line) && !OTHER_HEADING.test(line)) {
      inSection = true;
      continue;
    }
    if ((isHeading(line) && OTHER_HEADING.test(line)) || SECTION_END.test(line)) {
      inSection = false;
      continue;
    }
    // A long paragraph ends a list section.
    if (inSection && line.length > 160) inSection = false;
    if (inSection && strip(line).length > 1) fromSections.push(strip(line));
  }
  if (fromSections.length > 0) return fromSections.slice(0, MAX_REQUIREMENTS);

  return lines
    .filter((line) => BULLET.test(line))
    .map(strip)
    .filter((line) => line.length > 1)
    .slice(0, MAX_REQUIREMENTS);
}

/** Lines that come after a nice-to-have heading ("Det er fint om du har", "Nice to have"). */
export function niceToHaveLines(posting: string): Set<string> {
  const nice = new Set<string>();
  let inNice = false;
  for (const raw of posting.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if ((isHeading(line) && (REQUIREMENT_HEADING.test(line) || OTHER_HEADING.test(line))) || SECTION_END.test(line)) {
      inNice = NICE_HINTS.test(line);
      continue;
    }
    if (inNice) nice.add(line.replace(BULLET, "").trim());
  }
  return nice;
}

function significantWords(text: string): string[] {
  return Array.from(
    new Set(
      normalizeForMatch(text)
        .split(/[^\p{L}\p{N}+#.]+/u)
        .map((word) => word.replace(/\.$/, ""))
        .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
    ),
  );
}

function keywordGapAnalysis(input: AnalysisInput): GapAnalysis {
  const nb = input.language === "nb";
  const cvLines = input.cvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3);

  const requirementLines = extractRequirementLines(input.posting);
  const niceLines = niceToHaveLines(input.posting);
  const extra = input.keywords.filter(Boolean).map((keyword) => (nb ? `Nøkkelord: ${keyword}` : `Keyword: ${keyword}`));

  const requirements: Requirement[] = [...requirementLines, ...extra].map((line) => {
    const words = significantWords(line.replace(/^(Nøkkelord|Keyword): /, ""));
    let best = { line: null as string | null, hits: [] as string[] };
    for (const cvLine of cvLines) {
      const normalized = normalizeForMatch(cvLine);
      const hits = words.filter((word) => normalized.includes(word));
      if (hits.length > best.hits.length) best = { line: cvLine, hits };
    }
    const status = best.hits.length >= 2 ? "covered" : best.hits.length === 1 ? "partial" : "missing";
    const found = best.hits.join(", ");
    return {
      requirement: line,
      type: NICE_HINTS.test(line) || niceLines.has(line) ? "nice" : "must",
      status,
      cvEvidence: status === "missing" ? null : best.line,
      reasoning:
        status === "missing"
          ? nb
            ? "Demo: ingen av ordene i kravet ble funnet i CV-en."
            : "Demo: none of the words in this requirement were found in the CV."
          : nb
            ? `Demo: fant ordene «${found}» i CV-en. En ekte KI-analyse ville vurdert betydningen, ikke bare ordene.`
            : `Demo: found the words "${found}" in the CV. A real AI analysis would judge the meaning, not just the words.`,
      nextStep: nb
        ? "Legg inn en API-nøkkel for å få konkrete forslag fra KI-en."
        : "Add an API key to get concrete suggestions from the AI.",
    };
  });

  return {
    summary: nb
      ? "Demo-modus: dette er en enkel nøkkelordmatching, ikke en KI-analyse. Den viser hvordan eldre ATS-systemer sammenligner ord – uten å forstå innholdet. Legg inn en API-nøkkel (se SETUP.md) for en ekte analyse."
      : "Demo mode: this is simple keyword matching, not an AI analysis. It shows how older ATS systems compare words without understanding them. Add an API key (see SETUP.md) for a real analysis.",
    requirements,
    atsRelevance: {
      summary: nb
        ? requirements.length === 0
          ? "Fant ingen krav i annonsen. Demo-modusen leser linjer under overskrifter som «Vi ser etter deg som» eller «Kvalifikasjoner», og punktlister."
          : "Nøkkelordmatching straffer synonymer: står det «kundebehandling» i annonsen og «kundeservice» i CV-en, blir det ikke treff. Moderne systemer ser i økende grad på relevans."
        : requirements.length === 0
          ? "No requirements were found in the posting. Demo mode reads lines under headings like 'Requirements' or 'Qualifications', and bullet lists."
          : "Keyword matching punishes synonyms: if the posting says 'customer service' and your CV says 'helping customers', there is no match. Modern systems increasingly look at relevance.",
      phrasingSuggestions: [],
    },
  };
}

function templateCoverLetter(input: AnalysisInput, gap: GapAnalysis): CoverLetter {
  const nb = input.language === "nb";
  const strong = gap.requirements.filter((r) => r.status !== "missing").map((r) => r.requirement);
  return {
    paragraphs: [
      {
        text: nb
          ? "[Demo] Jeg søker herved på stillingen dere har lyst ut. Med en KI-nøkkel ville dette avsnittet blitt skrevet ut fra annonsen og CV-en din."
          : "[Demo] I am applying for the position you have advertised. With an AI key, this paragraph would be written from the posting and your CV.",
        rationale: nb ? "Demo-mal: åpningen bør nevne stillingen konkret." : "Demo template: the opening should name the position.",
        linkedRequirements: [],
      },
      {
        text: nb
          ? `[Demo] Her ville KI-en koblet erfaringen din til kravene du dekker best${strong.length ? `: ${strong.slice(0, 3).join("; ")}` : ""}.`
          : `[Demo] Here the AI would connect your experience to the requirements you match best${strong.length ? `: ${strong.slice(0, 3).join("; ")}` : ""}.`,
        rationale: nb
          ? "Demo-mal: hoveddelen bør bygge på krav som faktisk er dokumentert i CV-en."
          : "Demo template: the body should build on requirements your CV actually documents.",
        linkedRequirements: strong.slice(0, 3),
      },
      {
        text: nb
          ? "[Demo] Jeg ser frem til å høre fra dere."
          : "[Demo] I look forward to hearing from you.",
        rationale: nb ? "Demo-mal: en kort avslutning." : "Demo template: a short closing.",
        linkedRequirements: [],
      },
    ],
  };
}
