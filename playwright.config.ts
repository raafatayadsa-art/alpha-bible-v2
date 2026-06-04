import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config — runs against the Vite dev server.
 * Start `bun run dev` (or it will be auto-started via webServer below) and run:
 *   bunx playwright test
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "iphone-13",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:8080",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
