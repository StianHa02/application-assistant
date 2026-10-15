# Søknadsassistenten: AI CV & Job Application Assistant

A learning tool that shows students how AI is used in recruiting. Upload a CV and paste a job posting, and the app returns:

- **Gap analysis.** Every requirement in the posting gets a status (covered / partial / missing), a word-for-word quote from the CV as evidence, the reasoning, and a concrete next step.
- **ATS feedback.** How an applicant tracking system would read the CV, plus suggested phrasings that use the posting's language for experience the student actually has.
- **Cover-letter suggestions.** Paragraph by paragraph, each with an explanation of why it was written that way. The student picks what to keep.

The AI must quote the CV, and the app checks that every quote really exists. The coverage score is calculated by the app, not the AI, so it is the same every time.

IBE160 Programmering med KI, Høgskolen i Molde, autumn 2026. Group G05.

## Quick start

```bash
npm install
cp .env.example .env      # then fill in SESSION_SECRET and ENCRYPTION_KEY (see SETUP.md, step 3)
npm run setup             # creates the database + demo user demo@example.com / demo1234
npm run dev               # http://localhost:3000
```

No API key is needed: without one the app runs in **demo mode** with prewritten AI answers for the test cases in `fixtures/`. **[SETUP.md](SETUP.md)** has the full step-by-step guide, how to add a Claude API key, how to run the tests, and troubleshooting.

## Tech stack

| Part | Choice |
|---|---|
| App | Next.js 16 (App Router, Server Actions, TypeScript) |
| Styling | Tailwind CSS v4, with design tokens modelled on [echo.uib.no](https://echo.uib.no) |
| Database | SQLite via Prisma 7 (a single local file) |
| Login | Email + password (bcrypt) with a signed session cookie (`jose`) |
| Encryption | AES-256-GCM for CV text, postings and AI results |
| AI | Claude API (`claude-haiku-5-5` by default) with structured JSON output, or demo mode |
| PDF reading | `unpdf` |
| Tests | Vitest (unit + integration), Playwright (end-to-end) |

## Project structure

```
docs/                     brief, addendum, instructor feedback, implementation plan
fixtures/cases/           3 fictional test cases: CV (txt + pdf), posting, expected gaps, demo answers
prisma/                   database schema, migrations, seed (demo user)
scripts/eval.ts           checks the real model against the test cases (npm run eval)
src/app/                  pages and Server Actions
src/components/           UI components (analysis/ = result page)
src/i18n/                 Norwegian and English UI text
src/lib/ai/               ALL AI code: provider switch, Claude provider, demo provider, schemas
src/lib/ai/prompts/       the prompts sent to the model (versioned)
src/lib/analysis.ts       coverage score and quote check (deterministic, tested)
src/lib/crypto.ts         encryption at rest
tests/                    unit, integration and e2e tests
```

## How the AI part works

All AI calls go through `getAiProvider()` in [`src/lib/ai/index.ts`](src/lib/ai/index.ts):

| Situation | What happens |
|---|---|
| `ANTHROPIC_API_KEY` is set | Claude is called ([`claude-provider.ts`](src/lib/ai/claude-provider.ts)) |
| No key, or `AI_MODE=mock` | Demo mode ([`mock-provider.ts`](src/lib/ai/mock-provider.ts)): prewritten files for test cases, keyword matching for other CVs |

The app makes two calls:

1. **Gap analysis.** [`prompts/gap-analysis.ts`](src/lib/ai/prompts/gap-analysis.ts) returns `GapAnalysis` ([`schemas.ts`](src/lib/ai/schemas.ts)).
2. **Cover-letter suggestions.** [`prompts/cover-letter.ts`](src/lib/ai/prompts/cover-letter.ts) uses the gap analysis as input and returns `CoverLetter`.

Each analysis stores which provider, model and prompt version produced it.

## Privacy

- CV text, postings and AI results are encrypted in the database. Only the text is kept; the original file is discarded.
- Users can delete one analysis, all analyses, or their whole account (Settings).
- The repo contains only fictional CVs. Never commit real CVs or the `.env` file.
- In live mode the CV text is sent to Anthropic's API for analysis. Demo mode sends nothing anywhere.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the app in development mode |
| `npm run setup` | Create/migrate the database and add the demo user |
| `npm test` | Unit + integration tests |
| `npm run test:e2e` | Browser tests (Playwright) |
| `npm run eval` | Real-model check against the test cases (needs a key) |
| `npm run lint` / `npm run typecheck` | Code checks |
| `npm run fixtures:pdf` | Regenerate the test-CV PDFs from `cv.txt` |
