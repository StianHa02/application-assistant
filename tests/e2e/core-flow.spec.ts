import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, type Page, test } from "@playwright/test";

const CASE = path.join(process.cwd(), "fixtures", "cases", "a-it-support");
// A result page, not /analyses/new.
const RESULT_URL = /\/analyses\/(?!new)\w+$/;
const SCREENSHOTS = path.join(process.cwd(), "test-results", "screenshots");

async function registerNewUser(page: Page) {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Student");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("secret1234");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  return email;
}

async function analyseFixture(page: Page, file: "cv.pdf" | "cv.txt") {
  await page.goto("/analyses/new");
  await page.getByLabel(/^CV/).setInputFiles(path.join(CASE, file));
  await page.getByLabel("Job posting").fill(readFileSync(path.join(CASE, "posting.txt"), "utf8"));
  await page.getByRole("button", { name: "Analyse" }).click();
  await expect(page).toHaveURL(RESULT_URL);
}

test("landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("recruiting software");
  await expect(page.getByRole("link", { name: "Application Assistant" })).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOTS}/01-home.png`, fullPage: true });
});

test("core flow: register → upload CV → gap analysis → ATS → cover letter → delete all data", async ({ page }) => {
  await registerNewUser(page);
  await expect(page.getByText("You don't have any analyses yet.")).toBeVisible();
  // The header shows no user name, only navigation and "Log out".
  await expect(page.getByText("E2E Student")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "My analyses" })).toHaveAttribute("aria-current", "page");

  await page.goto("/analyses/new");
  await page.screenshot({ path: `${SCREENSHOTS}/02-new-analysis.png`, fullPage: true });
  await analyseFixture(page, "cv.pdf");

  // Result page: demo banner, 9 requirements, the 3 expected gaps
  await expect(page.getByText("Demo mode", { exact: true })).toBeVisible();
  await expect(page.getByTestId("requirement")).toHaveCount(9);
  await expect(page.locator('[data-testid="requirement"][data-status="missing"]')).toHaveCount(3);
  await expect(page.getByTestId("coverage-detail")).toContainText("5 covered");
  await expect(page.getByText("5 of 6 must-haves covered.")).toBeVisible();

  // The most important gap is selected first: a missing requirement with no CV quote.
  const detail = page.getByTestId("requirement-detail");
  await expect(detail.getByText("Not found in your CV.")).toBeVisible();

  // Selecting a requirement shows reasoning, next step and the highlighted CV excerpt.
  await page.getByTestId("requirement").filter({ hasText: "Has basic knowledge of networking" }).click();
  await expect(detail.getByRole("heading", { level: 2 })).toHaveText("Has basic knowledge of networking");
  await expect(detail.getByText("Next step")).toBeVisible();
  await expect(page.getByTestId("cv-excerpt").locator("mark")).toContainText("troubleshoot Wi-Fi");
  await page.screenshot({ path: `${SCREENSHOTS}/03-result-gap.png`, fullPage: true });

  // Arrow keys move through the list.
  await page.keyboard.press("ArrowDown");
  await expect(detail.getByRole("heading", { level: 2 })).not.toHaveText("Has basic knowledge of networking");
  await page.keyboard.press("ArrowUp");

  // Full CV in the drawer, closed with Escape.
  await page.getByRole("button", { name: "View full CV" }).click();
  await expect(page.getByTestId("document-drawer").locator("mark")).toContainText("troubleshoot Wi-Fi");
  await page.screenshot({ path: `${SCREENSHOTS}/04-drawer.png` });
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("document-drawer")).toHaveCount(0);

  // ATS tab
  await page.getByRole("tab", { name: "ATS feedback" }).click();
  await expect(page.getByText("Phrasing suggestions")).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOTS}/05-ats.png`, fullPage: true });

  // Cover letter suggestions
  await page.getByRole("tab", { name: "Cover letter" }).click();
  await page.getByRole("button", { name: "Suggest a cover letter" }).click();
  await expect(page.getByTestId("letter-paragraph")).toHaveCount(4);
  await page.getByRole("button", { name: "Use", exact: true }).first().click();
  await page.getByRole("button", { name: "Why?" }).first().click();
  await expect(page.getByText("Your draft")).toBeVisible();
  // Rewrite a single paragraph: only that one changes (demo mode returns a labelled placeholder).
  const second = page.getByTestId("letter-paragraph").nth(1);
  await second.getByRole("button", { name: "Rewrite" }).click();
  await expect(second).toContainText("[Demo] With an API key");
  await expect(page.getByTestId("letter-paragraph").first()).not.toContainText("[Demo]");
  await page.screenshot({ path: `${SCREENSHOTS}/06-letter.png`, fullPage: true });

  // Dashboard lists it
  await page.getByRole("link", { name: "My analyses" }).first().click();
  await expect(page.getByText("Summer Job 2027: IT Support")).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOTS}/07-dashboard.png` });

  // Delete all data
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByTestId("analysis-count")).toContainText("1 analysis");
  await page.getByRole("button", { name: "Delete all my analyses" }).click();
  await page.getByRole("button", { name: /Are you sure/ }).click();
  await expect(page.getByText("All your analyses have been deleted.")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByText("You don't have any analyses yet.")).toBeVisible();
});

test("invalid upload shows a readable error", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/analyses/new");
  await page.getByLabel(/^CV/).setInputFiles({ name: "cv.docx", mimeType: "application/msword", buffer: Buffer.from("x") });
  await page.getByLabel("Job posting").fill("We are looking for a student with customer service experience and good English.");
  await page.getByRole("button", { name: "Analyse" }).click();
  await expect(page.getByText("File type not supported. Use PDF or TXT.")).toBeVisible();
});

test("a user cannot open another user's analysis", async ({ page, browser }) => {
  await registerNewUser(page);
  await analyseFixture(page, "cv.txt");
  const url = page.url();

  const other = await browser.newPage();
  await registerNewUser(other);
  await other.goto(url);
  await expect(other.getByText("Page not found")).toBeVisible();
  await other.close();
});

test("demo user can log in", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@example.com");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("main").getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Summer Job 2027: IT Support")).toBeVisible();
});
