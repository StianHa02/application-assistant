import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against a production build on port 3100 with its own database (e2e.db)
// and the AI in demo mode, so they need no API key and don't touch your dev data.
// Each test registers its own user, so the database never needs to be wiped.
const PORT = 3100;
const env = {
  DATABASE_URL: "file:./e2e.db",
  AI_MODE: "mock",
  DEMO_DELAY_MS: "0",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npx prisma migrate deploy && npm run seed && npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: false,
    env,
  },
});
