import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
if (existsSync(".env")) process.loadEnvFile(".env");
export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 2, retries: 0,
  timeout: 60_000, expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure", screenshot: "only-on-failure",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined) }
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "npm run dev", url: "http://localhost:3000/api/health", reuseExistingServer: !process.env.CI, timeout: 120_000 }
});
