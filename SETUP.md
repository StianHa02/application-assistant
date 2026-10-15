# Setup: running Application Assistant locally

This guide takes you from a fresh clone to a running app. It assumes no prior knowledge of the project. Everything runs on your own machine: **no Docker, no cloud accounts and no API key are needed.** Without a key the app runs in demo mode (see step 6).

Estimated time: 5 minutes.

---

## 1. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20.9 or newer (LTS recommended; developed on 24) | `node -v` |
| npm | comes with Node | `npm -v` |
| git | any recent version | `git --version` |

## 2. Clone and install

```bash
git clone <repo-url> soknadsassistenten
cd soknadsassistenten
npm install
```

`npm install` also generates the database client (`prisma generate`) automatically.

## 3. Create your `.env` file

The app reads its settings from a `.env` file in the project root. Start from the example:

```bash
cp .env.example .env          # Windows (PowerShell): Copy-Item .env.example .env
```

Then fill in the two secrets. Generate each one with **one** of these commands and paste the output between the quotes:

```bash
openssl rand -base64 32
# or, if you don't have openssl (e.g. on Windows):
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | yes | Location of the SQLite database file. Leave as `file:./dev.db`. |
| `SESSION_SECRET` | yes | Signs the login cookie. Any random string of 32+ characters. |
| `ENCRYPTION_KEY` | yes | 32-byte base64 key that encrypts CVs, postings and AI results in the database. **If you change it, existing data can no longer be read** (see step 9). |
| `ANTHROPIC_API_KEY` | no | Enables real AI analysis. Leave empty for demo mode. |
| `CLAUDE_MODEL` | no | Which Claude model to use. Default `claude-haiku-5-5` (the cheapest). |
| `AI_MODE` | no | `auto` (default): use Claude if a key is set, otherwise demo mode. `mock`: always demo mode. |

`.env` is git-ignored. Never commit it.

## 4. Create the database

```bash
npm run setup
```

This creates `dev.db` with all tables (`prisma migrate deploy`) and adds a demo user with one sample analysis:

- **E-mail:** `demo@example.com`
- **Password:** `demo1234`

## 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000**. Log in with the demo user, or register your own account (accounts only exist in your local database).

## 6. Demo mode vs. real AI

**Demo mode (no key).** The app works fully, but the AI answers are not live:

- The fictional test CVs in `fixtures/cases/` get **prewritten answers** (`gap-analysis.json` and `cover-letter.json` in each folder).
- Any other CV gets a **simple keyword matching** result, clearly labelled as demo output. It shows how older applicant tracking systems (ATS) compare words without understanding them.
- A yellow banner on the result page says it's a demo.

**Real AI (with a key).**

1. Create an account at https://console.anthropic.com.
2. Go to **Billing** and add a small amount of credit ($5 is plenty for development).
3. Go to **API Keys → Create key** and copy the key.
4. Put it in `.env`:
   ```
   ANTHROPIC_API_KEY="sk-ant-..."
   ```
5. Restart `npm run dev`.

Expected cost with `claude-haiku-5-5` is about **$0.002 per analysis** (gap analysis + cover letter).

Note that in live mode the CV text is sent to Anthropic for analysis. Use the fictional test CVs, or your own CV only if you accept that.

## 7. Try it with a test case

1. Log in and click **New analysis**.
2. Upload `fixtures/cases/a-it-support/cv.pdf`.
3. Paste the content of `fixtures/cases/a-it-support/posting.txt` into the posting field.
4. Click **Analyse**.
5. On the result page, click a requirement in the list on the left to see the reasoning, the next step and the matching text from your CV and the posting.

| Case | Notes | Expected missing qualifications |
|---|---|---|
| `a-it-support` | IT student, summer job | Intune/Azure, ITIL, driver's licence |
| `b-data-analyst` | Logistics student, data internship | Python (pandas), shipping/seafood knowledge, cloud data platforms |
| `c-marketing` | Business student, two-column PDF | Google Ads/Meta, video editing, newsletters/Mailchimp |

The expected results are also in each case's `expected.json`.

## 8. Run the tests

```bash
npm test                  # unit + integration tests (Vitest), demo mode, no key needed
npx playwright install chromium   # first time only, downloads a test browser (~100 MB)
npm run test:e2e          # end-to-end tests in a real browser (Playwright)
npm run eval              # checks the REAL model against the test cases (needs a key, costs a few cents)
```

- The e2e tests build the app and run it on port 3100 with a separate database (`e2e.db`), so your own data is not touched.
- `npm run eval -- b-data` runs only the cases whose folder name contains `b-data`.

Other checks: `npm run lint` and `npm run typecheck`.

## 9. Start over with an empty database

Stop the app, delete the database file and set it up again:

```bash
rm dev.db                 # Windows (PowerShell): Remove-Item dev.db
npm run setup
```

Do this if you change `ENCRYPTION_KEY`, or if you want to get rid of all test data.

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| `ENCRYPTION_KEY is not set` / `SESSION_SECRET is not set` | Step 3: fill in both values in `.env` and restart. |
| `ENCRYPTION_KEY must be 32 bytes` | Generate the key with one of the commands in step 3. Don't type your own. |
| `Cannot find module '@/generated/prisma/client'` | Run `npx prisma generate` (normally done by `npm install`). |
| `The table main.User does not exist` | Run `npm run setup`. |
| Errors decrypting existing data after changing `ENCRYPTION_KEY` | Step 9: start over with an empty database. |
| Port 3000 already in use | Next.js picks the next free port and prints it, or stop the other process. |
| `npm install` fails building `better-sqlite3` | Use a Node LTS version. On macOS run `xcode-select --install`; on Windows install the "Desktop development with C++" build tools. |
| "The API key was rejected" | Check `ANTHROPIC_API_KEY` in `.env` (no spaces or quotes inside the key) and restart. |
| "The Anthropic account is out of credit" | Add credit under Billing in the Anthropic console. |
| "Found almost no text in the file" | The PDF is probably a scanned image. Export the CV as a text PDF, or save it as `.txt`. |
