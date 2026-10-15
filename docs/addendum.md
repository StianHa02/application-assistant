# Addendum: AI CV & Job Application Assistant

Supporting material that informed `brief.md` but doesn't belong in the brief itself.

## Original Assignment Text (verbatim, Norwegian)

> **AI CV & Job Application Assistant**
>
> Beskrivelse: Et verktøy som hjelper studenter med å lage tilpassede søknader basert på CV og
> stillingsannonser. Det foreslår forbedringer og peker på manglende kvalifikasjoner, og gir en realistisk
> opplevelse av hvordan AI brukes i rekruttering.
>
> Vanskelighetsgrad: Middels
>
> Sikkerhet/innlogging: Ja, personopplysninger og dokumenter. Kryptert lagring anbefales.
>
> Kjøp/salg over nettet: Nei.
>
> Data inn: CV (PDF/DOC/TXT), stillingsannonse, nøkkelord, ønsket tone/stil, tidligere søknader.
>
> Data ut: Tilpasset søknadsbrev, CV‑forbedringsforslag, manglende kvalifikasjoner/gap‑analyse,
> ATS‑optimalisering.
>
> Beslutningspunkter: Grad av omskriving vs. forslag, filformat (DOC/MD/PDF), språk/stilnivå.

Difficulty level ("Middels" / Medium) was assigned as part of the spec; the group confirmed it doesn't affect how the brief is scoped.

## Comparable Products Research (2026)

- **JobScan** — match-score plus ATS-engine-specific analysis (Workday, Greenhouse, Taleo, iCIMS); optimizes an existing resume rather than writing one from scratch.
- **Rezi** — strict ATS-safe single-column templates, strong AI drafting, tech-role focus, one-time pricing.
- **Teal** — all-in-one: resume builder + job tracker + match score in one workspace; most generous free tier.
- **Kickresume** — heaviest AI-written drafting and largest template library, but two-column designs hurt ATS parse rates.

Gap analysis and tone-matched cover-letter generation are less commoditized than ATS scoring/keyword-matching, which is now table-stakes across nearly every competitor. The clearest differentiation opportunity for a student-focused tool: pairing gap analysis with an explicit "what to do about it" (a skill to add, a project to build/surface) rather than just flagging the gap, plus leaning into the teaching angle ("this is what recruiting AI is doing to your resume") rather than positioning purely as an output generator.

## ATS Reality Check

Not mythologized — the large majority of recruiters do use ATS keyword filtering (cited: ~99.7% per Jobscan's 2026 State of Job Search). But modern (2023–2025-era) ATS engines increasingly do semantic/context matching rather than raw keyword string-matching, and penalize keyword-stuffing or hidden-text tricks. Implication for this project: "ATS optimization" as a feature should be framed as relevance and evidence-based phrasing against the actual posting, not keyword injection — a tool that promises naive keyword-stuffing would be building the wrong (and now outdated) thing.

Sources: Jobscan ("Best AI Resume Builders 2026"), Rezi Blog, Teal ("Best AI Resume Builders 2026"), ATS Verification ("AI Resume Builders Tested 2026"), ApplyGoat ("AI Resume Screening: 6 Myths vs. Facts"), The Interview Guys ("ATS Resume Optimization 2026 Guide").

## Privacy Considerations

CVs, job postings, and past applications constitute meaningful PII — names, addresses, employment history, sometimes national ID or photo. Standard considerations flagged for the team: encryption at rest, minimal retention with an explicit delete path, no training/reuse of user documents without consent, and — since this is a Norwegian student project — explicit awareness of GDPR obligations (purpose limitation, right to erasure).

## Decision Points — Full Reasoning

The brief's Scope section states each default tersely; the reasoning behind each:

1. **Degree of rewriting vs. suggestion.** Recommended default: offer both — suggestions by default (lower risk of the output feeling inauthentic or over-AI-generated), with a full-rewrite option the student can request. Confirm as a team.
2. **Output file format (DOC / MD / PDF).** Recommended default: PDF for the cover letter (what an employer actually receives) and Markdown/plain text internally for suggestions and gap analysis (easier to render as inline feedback in the UI). Confirm as a team.
3. **Language / style level.** Recommended default: student-selectable tone (e.g., formal / conversational-professional) with Norwegian and English supported at minimum, given the course context. Confirm as a team, especially whether multi-language support is realistic in the time available.

## Reorganization Note

During this session, the BMAD toolkit (`_bmad/`, `.claude/`) was found sitting in a standalone `BMAD/` folder on the Desktop, separate from the group's actual git repo (`G05-chen-eldebsy-jama-johansen`), which already had `.gitignore` rules written for a BMAD setup living at its root. Per Hatem's decision, the toolkit was moved into the repo root so planning artifacts (including this brief) are tracked in git and visible to the rest of the group. Two now-empty leftover folders from the old location (`project/BMAD/.docs`, stray `BMAD/.docs`) were left in place on the Desktop for manual cleanup — deleting them wasn't done automatically.
