import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, type Page, test } from "@playwright/test";

const CASE = path.join(process.cwd(), "fixtures", "cases", "a-it-support-nb");
// A result page, not /analyses/new.
const RESULT_URL = /\/analyses\/(?!new)\w+$/;
const SCREENSHOTS = path.join(process.cwd(), "test-results", "screenshots");

async function registerNewUser(page: Page) {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto("/register");
  await page.getByLabel("Navn").fill("E2E Student");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill("hemmelig123");
  await page.getByRole("button", { name: "Opprett konto" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  return email;
}

test("landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("rekrutteringssystemet");
  await page.screenshot({ path: `${SCREENSHOTS}/01-home.png`, fullPage: true });
});

test("core flow: register → upload CV → gap analysis → cover letter → delete all data", async ({ page }) => {
  await registerNewUser(page);
  await expect(page.getByText("Du har ingen analyser ennå.")).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOTS}/02-dashboard-empty.png` });

  // New analysis with fixture case A (PDF)
  await page.getByRole("link", { name: "Ny analyse" }).first().click();
  await page.getByLabel(/^CV/).setInputFiles(path.join(CASE, "cv.pdf"));
  await page.getByLabel("Stillingsannonse").fill(readFileSync(path.join(CASE, "posting.txt"), "utf8"));
  await page.screenshot({ path: `${SCREENSHOTS}/03-new-analysis.png`, fullPage: true });
  await page.getByRole("button", { name: "Analyser" }).click();

  // Result page: demo banner, 9 requirements, the 3 expected gaps
  await expect(page).toHaveURL(RESULT_URL);
  await expect(page.getByText("Demo-modus – eksempelsvar")).toBeVisible();
  await expect(page.getByTestId("requirement")).toHaveCount(9);
  await expect(page.locator('[data-testid="requirement"][data-status="missing"]')).toHaveCount(3);
  await expect(page.getByTestId("coverage-detail")).toContainText("5 av 9 krav dekket");

  // Clicking a requirement highlights the quote in the CV and shows next step
  await page.getByTestId("requirement").filter({ hasText: "Grunnleggende kunnskap om nettverk" }).click();
  await expect(page.getByTestId("cv-column").locator("mark")).toContainText("feilsøking av wifi");
  await expect(page.getByText("Neste steg")).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOTS}/04-result-gap.png`, fullPage: true });

  // Cover letter suggestions
  await page.getByRole("tab", { name: "Søknadsbrev" }).click();
  await page.getByRole("button", { name: "Lag forslag til søknadsbrev" }).click();
  await expect(page.getByTestId("letter-paragraph")).toHaveCount(4);
  await page.getByRole("button", { name: "Ta med" }).first().click();
  await page.getByRole("button", { name: "Hvorfor?" }).first().click();
  await expect(page.getByText("Ditt utkast")).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOTS}/05-result-letter.png`, fullPage: true });

  // Language switch to English
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Cover letter" })).toBeVisible();
  await page.getByRole("button", { name: "NO", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Søknadsbrev" })).toBeVisible();

  // Dashboard lists it
  await page.getByRole("link", { name: "Mine analyser" }).first().click();
  await expect(page.getByText("Sommerjobb 2027: IT-support")).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOTS}/06-dashboard.png` });

  // Delete all data
  await page.getByRole("link", { name: "Innstillinger" }).click();
  await expect(page.getByTestId("analysis-count")).toContainText("1 analyser");
  await page.getByRole("button", { name: "Slett alle analysene mine" }).click();
  await page.getByRole("button", { name: /Er du sikker/ }).click();
  await expect(page.getByText("Alle analysene dine er slettet.")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText("Du har ingen analyser ennå.")).toBeVisible();
});

test("invalid upload shows a readable error", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/analyses/new");
  await page.getByLabel(/^CV/).setInputFiles({ name: "cv.docx", mimeType: "application/msword", buffer: Buffer.from("x") });
  await page.getByLabel("Stillingsannonse").fill("Vi søker en student med erfaring fra kundeservice og gode norskkunnskaper.");
  await page.getByRole("button", { name: "Analyser" }).click();
  await expect(page.getByText("Filtypen støttes ikke. Bruk PDF eller TXT.")).toBeVisible();
});

test("a user cannot open another user's analysis", async ({ page, browser }) => {
  await registerNewUser(page);
  await page.goto("/analyses/new");
  await page.getByLabel(/^CV/).setInputFiles(path.join(CASE, "cv.txt"));
  await page.getByLabel("Stillingsannonse").fill(readFileSync(path.join(CASE, "posting.txt"), "utf8"));
  await page.getByRole("button", { name: "Analyser" }).click();
  await expect(page).toHaveURL(RESULT_URL);
  const url = page.url();

  const other = await browser.newPage();
  await registerNewUser(other);
  await other.goto(url);
  await expect(other.getByText("Fant ikke siden.")).toBeVisible();
  await other.close();
});

test("demo user can log in", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-post").fill("demo@example.com");
  await page.getByLabel("Passord").fill("demo1234");
  await page.getByRole("button", { name: "Logg inn" }).last().click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Sommerjobb 2027: IT-support")).toBeVisible();
});
