# Plan: AI CV & Job Application Assistant (IBE160, group G05)

## Context

The folder `david_app/` holds:
- `brief.md`: the product brief
- `addendum.md`: background notes
- `tilbakemelding-product-brief.md`: the instructor's feedback
- `.memlog.md`: a session log

There is no code yet.

**What the app does.** It helps students tailor job applications. A student uploads a CV and pastes a job posting. The app returns a gap analysis that explains its reasoning, plus cover-letter suggestions. It should also show how AI screening in recruiting really works.

**Instructor feedback.** The idea is approved, but four changes were requested:
- a narrower v1 core flow
- a plan for the LLM: which model, what it costs, the API key, and a **demo/mock mode** so the examiner can run the app without a key
- success criteria that can be tested
- ATS feedback folded into the gap analysis instead of a separate score module

**Platform: desktop web app built with Next.js.** The work is reading long documents side by side (CV, posting and analysis), and the examiner runs it locally from a README. Neither fits a phone well.

**Decisions confirmed with the user:**
- Scope follows the instructor's v1, with everything else in phase 2.
- Norwegian and English are both supported from the start.
- **The app runs locally only:** no deployment and no hosted backend.
- **SQLite + Auth.js** for the database and login. This means nothing extra to install.
- Supabase is not used, so the Supabase entry in `.mcp.json` should be removed.
- **LLM:** the Claude API with a group-owned key, plus a built-in demo mode (see below).

## Where the LLM comes from

The instructor's feedback names two acceptable options. The plan uses **both**:

1. **Demo mode (the default without a key).** The app ships with saved AI responses for the fictional test CVs, and the generic sample cases still return useful sample output. The examiner can try the whole app with no key, no account and no cost. Automated tests also use this mode.
2. **Real AI with your own key.**
   - **Development:** one group member creates an Anthropic account and buys a small amount of prepaid credit. At about $0.002 per analysis, $5 is enough for the whole semester. The key goes in `.env.local` and is never committed. Each member uses it locally.
   - **The examiner:** the README explains how to add their own key for live AI. They don't need to.

**Model:** `claude-haiku-5-5`, the cheapest current Claude model ($0.10 per 1M input tokens, $0.50 per 1M output).
- It is read from the `CLAUDE_MODEL` env var, so `claude-sonnet-5-5` ($2 / $10) can be swapped in if quality is too low.
- To get a key: console.anthropic.com → Billing → buy credit → API Keys → Create key → set `ANTHROPIC_API_KEY` in `.env.local`.

**Ask the instructor:** whether the course provides API keys or credit. If it does, use those instead and keep the demo mode as is.

## Assignment deliverables beyond the code (from the instructor feedback)

| # | Deliverable | Grading criterion it serves |
|---|---|---|
| 1 | **Update `brief.md`**: the v1 core flow in 3–5 steps, a phase 2 list, a concrete primary user (e.g. a HiMolde bachelor student applying for a summer job or internship), the LLM/cost/demo-mode plan, testable success criteria, and every `[ASSUMPTION]` resolved. Commit it so git shows how it evolved. | 1 Process (30%), 2 Scope (20%) |
| 2 | **BMAD flow**: PRD → architecture → epics & stories, each written before that part is built. Reference stories in commits/PRs so the examiner can trace brief → story → code. | 1 Process (30%) |
| 3 | **Show the AI steering**: keep the app's prompts as readable files (`src/lib/ai/prompts/`), and store the Claude Code instructions/plans used in `docs/`. | 1 Process |
| 4 | **3–5 fictional test sets**: CV + posting + expected missing qualifications. Never use real CVs from group members. | 3 Testing (15%), 7 Repo (5%) |
| 5 | **Automated tests**: unit + integration tests with a mocked LLM, one e2e test of the core flow, and file parsing on a few different CV layouts. | 3 Testing (15%) |
| 6 | **Screen sketches** for the core flow, especially the side-by-side result screen. They go in `docs/`. | 4 Design (10%) |
| 7 | **Simple architecture** with all LLM calls in one swappable module (`src/lib/ai/`). | 5 Code quality (10%) |
| 8 | **README + running locally**: prerequisites, setup, demo user, demo mode without a key, optional key setup, how to run the tests. | 6 README (10%) |
| 9 | **Repo hygiene**: `.env*` gitignored, `.env.example` committed, no keys in the code, fictional data only, docs collected in `docs/`. | 7 Repo (5%) |
| 10 | Work in the **group's git repo** (`G05-chen-eldebsy-jama-johansen`), not this loose folder, so the history counts. | 1, 7 |

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript), server actions | One codebase for UI and server logic |
| UI | Tailwind CSS + shadcn/ui | Fast, accessible components |
| Database | SQLite + Prisma | A single file; no install or server for the examiner |
| Auth | Auth.js v5 Credentials provider + bcrypt | Email + password, entirely local |
| CV files | Parse on upload and store only the **extracted text** (encrypted); discard the original file | Simpler, and collects less personal data (GDPR) |
| Encryption at rest | Node `crypto` AES-256-GCM, `ENCRYPTION_KEY` in `.env.local` | Encrypts CV text, posting text and AI results |
| PDF parsing | `unpdf` (TXT read directly) | One well-documented library, as the instructor advised |
| i18n | `next-intl` with `nb` + `en` | UI language, and the output language passed into the prompts |
| LLM | `@anthropic-ai/sdk`, `client.messages.parse()` + `zodOutputFormat` | Output is validated against a schema |
| Validation | Zod | Same schemas for the real API, mock data and tests |
| Tests | Vitest (unit/integration), Playwright (e2e in demo mode) | |

## Project layout

Scaffold Next.js at the root of the group repo, with the planning docs in `docs/`.

```
docs/                     brief.md, addendum.md, feedback, PRD, architecture, stories, sketches, plans
prisma/schema.prisma      User, CvDocument, JobPosting, Analysis
prisma/seed.ts            demo user (demo@example.com / demo1234) + one sample analysis
fixtures/                 3–5 fictional CVs (PDF + TXT), postings, expected-gaps.json, mock responses
messages/{nb,en}.json     UI strings
src/auth.ts               Auth.js config (Credentials provider)
src/middleware.ts         protected routes + locale
src/lib/crypto.ts         encrypt()/decrypt() AES-256-GCM helpers
src/lib/parse-cv.ts       PDF/TXT → text, size/type validation, readable errors
src/lib/ai/
  index.ts                getAiProvider(): picks Claude or mock (mock if AI_MODE=mock or no key)
  schemas.ts              Zod: GapAnalysis, CoverLetterSuggestions
  claude-provider.ts      the only file that imports the Anthropic SDK
  mock-provider.ts        returns fixture responses (matched by fixture hash, else a generic sample)
  prompts/                gap-analysis.ts, cover-letter.ts (versioned, readable by the examiner)
src/app/[locale]/
  login, register
  dashboard               list of past analyses
  analyses/new            upload CV + paste posting + tone + language + keywords
  analyses/[id]           result view
  settings                language, "delete all my data"
scripts/eval.ts           npm run eval: runs the real model on the fixtures and reports hits/misses
```

## Core AI design

The design follows `brief.md` (four outputs, visible reasoning, ATS as relevance, suggestion mode) and the instructor's feedback (ATS folded into the gap analysis, a testable structure, one swappable LLM module, demo mode).

### Real AI or demo files: how the app chooses

All AI work goes through `getAiProvider()` in `src/lib/ai/index.ts`.

| Situation | Provider used | What happens |
|---|---|---|
| `ANTHROPIC_API_KEY` is set | `claude-provider.ts` | Calls Claude (`CLAUDE_MODEL`, default `claude-haiku-5-5`) |
| No key set | `mock-provider.ts` | Returns a prewritten JSON file (demo mode) |
| `AI_MODE=mock` (tests, or to save credit) | `mock-provider.ts` | Demo mode even when a key is present |

**Demo mode details:**
- Each fictional test CV + posting pair in `fixtures/` has its own prewritten response files: `fixtures/<case>/gap-analysis.json` and `fixtures/<case>/cover-letter.json`. These are matched by a hash of the CV and posting text, so uploading a fixture CV gives its exact matching result.
- **Any other CV** gets a generic sample from `fixtures/_generic/` in the selected language.
- The result screen shows a visible **"Demo mode – example response, not a real analysis"** banner, so nobody mistakes sample output for a real assessment.
- A short delay simulates the real call, so loading states can be seen and tested.
- The prewritten files are validated against the same Zod schemas as real responses (a unit test loads every fixture). This keeps them in sync with the app.
- **If a key is set but the call fails** (network error, invalid key, out of credit, refusal), the app shows a clear error. It does **not** silently fall back to demo data, which would mislead the user.

### Before the AI (plain code)

1. Extract the text from the uploaded PDF/TXT.
2. Validate the inputs: the CV is not empty, it is under the size limit, and the posting is pasted.
3. Build the prompt: fixed instructions + `<cv>…</cv>` + `<job_posting>…</job_posting>`. The model is told to treat the tagged text as data, not instructions.

### Call 1: gap analysis (CV check + ATS feedback)

**Instructions to the model:**
1. List every requirement in the posting and mark it must-have or nice-to-have.
2. For each requirement, search the CV. Any evidence must be a **word-for-word quote** from the CV.
3. Set the status to covered / partial / missing and explain why.
4. Give a concrete next step, for example surfacing an experience the student already has, or rephrasing it.
5. Suggest better phrasings that use the posting's language with real CV content. Never keyword stuffing.

**Output schema (`GapAnalysis`):**
- `requirements[]`, where each entry has:
  - `requirement`
  - `type`: must / nice
  - `status`: covered / partial / missing
  - `cvEvidence`: string or null
  - `reasoning`
  - `nextStep`
- `atsRelevance`: a `summary`, plus `phrasingSuggestions[]` of `{ original, suggested, why }`

**Post-processing in code (not by the AI):**
- **Coverage score:** "X of Y requirements covered", with must-haves weighted higher. It is calculated from the statuses, so it is deterministic and testable.
- **Quote check:** every `cvEvidence` must appear in the CV text (whitespace-normalised). If it doesn't, the item is flagged "evidence not found" in the UI. This catches invented evidence.

### Call 2: cover-letter suggestions (suggestion mode)

**Input:** the CV, the posting, the call 1 result, the tone (formal / conversational-professional) and the language (nb / en).

**Instructions to the model:**
- Write 3–5 paragraphs.
- Use only facts found in the CV, and never invent experience.
- Target the strongest matches.
- Don't hide gaps.
- Give each paragraph a short rationale.

**Output schema (`CoverLetterSuggestions`):** `paragraphs[]` of `{ text, rationale, linkedRequirements[] }`.

The student can accept, copy or ignore each paragraph. Full rewrite mode comes in phase 2.

### Model settings and error handling

- **Calling and parsing:** both calls use `client.messages.parse()` with `zodOutputFormat(schema)`, adaptive thinking at effort `medium`, and the language passed into the prompt.
- **Errors:** if `stop_reason` is `max_tokens` or `refusal`, or `parsed_output` is null, the user sees a readable error, and the error is logged without CV content.
- **Prompt files:** prompts live in `src/lib/ai/prompts/` as versioned files. The prompt version is saved with each analysis so results can be traced to the prompt that produced them.

## Visual style: modelled on echo.uib.no

The look comes from echo's public source (`echo-webkom/echo-web-mono`, `apps/web/src/styles/globals.css`, `components/ui/button.tsx`, `site-header.tsx`, `footer.tsx`). Only the design tokens and patterns are reused. echo's **logo, name and content are not used**: the app gets its own name and a simple text logo.

**Tokens** (in `src/app/globals.css`, Tailwind v4 `@theme inline` with CSS variables, the same structure as echo):

| Token | Light | Dark |
|---|---|---|
| background | `#f9fafb` | `#151210` |
| foreground | `#171923` | `#eeeeee` |
| card | `#fefefe` | `#171717` |
| muted / muted-foreground | `#ebeef4` / `#64748b` | `#181818` / `#999999` |
| border | `#9db2cd` | `#4d4d4d` |
| primary (teal) / hover / dark | `#008fa3` / `#32a5b5` / `#006f83` | same |
| secondary (yellow) / hover / dark | `#fed879` / `#ffe195` / `#f9c652` | same |
| success | `#48bb78` (dark `#2f855a`) | same |
| warning | `#f6ad55` (dark `#b7791f`) | same |
| destructive | `#e53e3e` (dark `#c53030`) | same |
| info | `#3182ce` | same |
| footer / footer-border | `#f2cc8f` / `#d4a373` | `#171717` |
| radius | `0.5rem` | same |

**Typography:** Inter (`next/font/google`, `--font-inter`) for everything, and IBM Plex Mono for CV/posting quotes.

**Components:**
- **Buttons** (shadcn `button.tsx` modified the echo way): `rounded-full`, `font-semibold`, a 1px border in the `-dark` shade, `transition-colors duration-300`.
  - Variants: `default` (teal), `secondary` (yellow; used for "Logg inn" in the header), `outline`, `ghost`, `destructive`, `link`.
- **Header:** sticky, `bg-card border-b`, a `max-w-7xl` container, the logo and nav on the left, and on the right the theme toggle plus a yellow "Logg inn" button (or the user menu).
- **Footer:** the warm sand-coloured `bg-footer` block with `py-24` and link columns.
- **Cards:** `bg-card`, `rounded-lg`, a `border`, and generous padding.
- **Content width:** `max-w-7xl mx-auto px-4`.
- **Light/dark toggle:** uses `next-themes` with the `.dark` class, like echo.

**Status colours in the gap analysis:**
- covered = success green
- partial = warning orange
- missing = destructive red
- teal primary is used for actions and links

## Result screen (key design element)

- **Three columns:** CV text on the left, gap analysis in the middle, posting on the right.
- Clicking a requirement highlights the matching quote in the CV and the matching line in the posting.
- Each requirement card shows a status badge, the reasoning, and an expandable "next step".
- A cover-letter tab shows each paragraph with a "why" toggle and buttons to copy or accept it.

## Build order (v1)

The **paperwork** (updated brief, PRD → architecture → stories, screen sketches) is the group's job and runs in parallel. This build covers the code and setup docs.

1. **Scaffold:** in this folder, `git init`, then:
   - move the existing `.md` files into `docs/`;
   - add Next.js (TypeScript, App Router, Tailwind v4), shadcn/ui, Prisma + SQLite, next-intl (nb/en), next-themes, ESLint/Prettier and Vitest;
   - add `.gitignore` (`.env*` except `.env.example`, `*.db`) and `.env.example`;
   - delete `.mcp.json`, since Supabase is no longer used.
2. **Styling foundation:** echo tokens in `globals.css`, the Inter + IBM Plex Mono fonts, the button variants, the site header and footer, and the theme toggle.
3. **Auth:** register, login and logout; protected routes; seeded demo user.
4. **Encryption + models:** `crypto.ts` with tests; Prisma models with encrypted fields.
5. **Upload + parsing:** PDF/TXT upload (max 5 MB), extract the text, show a preview, readable errors for invalid or empty files.
6. **AI module:** Zod schemas; the mock provider and fixtures first, then the Claude provider. Prompts in Norwegian and English.
7. **Analysis flow:** new-analysis form → server action → save the encrypted result → result screen.
8. **Cover-letter suggestions:** tone and language options.
9. **Dashboard + delete:** delete a single analysis, and "delete all my data" (GDPR erasure).
10. **Tests + eval.**
11. **`SETUP.md` + `README.md`** (see below).

## `SETUP.md`: running everything locally

A step-by-step guide written for someone who has never seen the project, such as the examiner or a new group member:

1. **Prerequisites:** Node.js LTS (≥ 20) and npm, git. No Docker and no accounts needed.
2. **Clone and install:** `git clone …`, `cd …`, `npm install`.
3. **Environment:** `cp .env.example .env.local`. Then generate the secrets with the commands given (for example `npx auth secret` for `AUTH_SECRET` and `openssl rand -base64 32` for `ENCRYPTION_KEY`), with a table explaining every variable:
   - `AUTH_SECRET`
   - `ENCRYPTION_KEY`
   - `DATABASE_URL` (`file:./dev.db`)
   - `ANTHROPIC_API_KEY` (optional)
   - `CLAUDE_MODEL` (default `claude-haiku-5-5`)
   - `AI_MODE` (`auto` | `mock`)
4. **Database:** `npx prisma migrate dev`, then `npm run seed` (creates demo user `demo@example.com` / `demo1234` and a sample analysis).
5. **Run:** `npm run dev`, then open http://localhost:3000.
6. **Demo mode vs real AI:**
   - Without a key, demo mode is on and the banner is shown.
   - To use Claude: create a key at console.anthropic.com (Billing → credit → API Keys), put it in `.env.local`, and restart. Expected cost is about $0.002 per analysis.
7. **Try it:** upload a fixture CV from `fixtures/` (expected results listed per case).
8. **Tests:**
   - `npm test` runs the unit and integration tests.
   - `npx playwright install` followed by `npx playwright test` runs the e2e tests.
   - `npm run eval` checks the real model against the fixtures (requires a key and costs a few cents).
9. **Reset:** `npx prisma migrate reset` wipes the local database and reseeds it.
10. **Troubleshooting:**
    - port 3000 in use
    - missing `ENCRYPTION_KEY`
    - a Prisma client that wasn't generated
    - a 401 from Anthropic (wrong key) or out of credit
    - PDFs that are scanned images (no text can be extracted)

`README.md` stays short: what the app is, screenshots, a quick start (5 commands), a link to `SETUP.md`, the project structure, and links to `docs/` (brief, PRD, prompts).

## Phase 2 (after v1 is stable)

- DOCX upload (mammoth)
- PDF export of the cover letter
- Full rewrite mode
- Previous applications as input
- Posting supplied as a link
- Optional upgrade to the Sonnet model

## Testable success criteria (for updating the brief)

- **Fixture set A:** the gap analysis finds the 3 missing qualifications listed in `expected-gaps.json`. Checked with `npm run eval` against the real model, and with tests in mock mode.
- **Complete analyses:** every requirement has a `status` and `reasoning`, and every "covered" requirement has a CV quote. Enforced by the Zod schema and tested.
- **Bad uploads:** an invalid or oversized file shows a readable error message in the selected language.
- **Delete:** a user can delete all their data, after which their rows are gone (integration test).
- **Encryption:** CV text in the database is not readable as plain text (a test reads the raw row).
- **Isolation:** user A cannot open user B's analyses (the route returns 404).
- **No key needed:** with no `ANTHROPIC_API_KEY`, the whole core flow works in demo mode (Playwright e2e).

## Verification

- **`npm test` (Vitest)** covers:
  - crypto round-trip
  - parsing the fixture PDFs/TXTs
  - schema validation
  - the mock provider
  - the delete flow
  - user isolation
  - stored data being encrypted
- **`npx playwright test` (demo mode):** register → upload a fixture CV → paste a posting → see the gap analysis and cover letter → switch language → delete all data.
- **`npm run eval`** (needs a key, costs a few cents): runs Haiku on all fixtures and prints hits/misses per expected gap.
- **Manual check:** in a fresh clone, run `cp .env.example .env.local && npm i && npx prisma migrate dev && npm run seed && npm run dev`, then log in as the demo user. This must work with no API key and none of the group's accounts.

---

## Changes made during implementation (2026-10-15)

Where the finished v1 differs from the plan above, and why:

| Plan | Built | Reason |
|---|---|---|
| Auth.js v5 (Credentials) | Own small session layer: bcrypt password hash + signed JWT cookie (`jose`), following the official Next.js authentication guide (`src/lib/session.ts`, `src/lib/auth.ts`) | Auth.js v5 is still in beta; the Next.js guide pattern is less code and has no extra dependency to keep in sync with Next.js 16. |
| `next-intl` with `[locale]` routes | Small dictionary per language (`src/i18n/nb.ts`, `en.ts`) and a `locale` cookie | Two languages don't need a library; URLs stay simple. TypeScript enforces that both dictionaries have the same keys. |
| 4 tables (User, CvDocument, JobPosting, Analysis) | 2 tables (User, Analysis) | One CV + one posting per analysis is enough for v1 (instructor: "keep versioning simple"). |
| `.env.local` | `.env` | Both Prisma's CLI and Next.js read `.env`; one file is simpler for the examiner. |
| Generic prewritten file for non-fixture CVs in demo mode | Simple keyword matching on the actual input, clearly labelled as demo | Gives a meaningful result for any CV and demonstrates how old keyword-based ATS works, compared with the AI's relevance-based analysis. |
| 3–5 fixture cases | 3 cases (`fixtures/cases/`), one in English, one with a two-column PDF | Minimum the instructor asked for, covering both languages and a harder PDF layout. |
| `client.messages.parse()` | `client.messages.create()` with the same JSON schema, then own Zod validation | `parse()` throws on a refusal or a cut-off answer before `stop_reason` can be checked. Found by a unit test; now each case gets its own error message. |
| — | Next.js 16 "Cache Components" turned off | Not needed for a local app, and it requires Suspense boundaries around every session read. |

**Live API check (2026-10-15):** `npm run eval` with `claude-haiku-5-5` passed 18/18 checks. All expected missing and covered requirements were found in all 3 test cases, and 18/18 CV quotes were verified. The gap analysis took 15–25 seconds per case.
