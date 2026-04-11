// @ts-nocheck
const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright config — runs the deck through a real browser against a local
 * static server. No build step required: the webServer block spins up
 * `python3 -m http.server` automatically.
 */
module.exports = defineConfig({
  testDir: "./tests",
  timeout: 15000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:8000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node scripts/serve.js 8000",
    port: 8000,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    stdout: "ignore",
    stderr: "ignore",
    env: { QUIET: "1" },
  },
  projects: [
    {
      // Desktop suite — runs everything except the mobile-specific specs.
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1280, height: 800 } },
      testIgnore: /mobile\.spec\.js/,
    },
    {
      // Mobile suite — iPhone 13 viewport with touch events. Forces chromium
      // (the iPhone descriptor defaults to webkit, which would require an
      // extra browser download). Only runs the mobile-specific specs.
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        defaultBrowserType: "chromium",
      },
      testMatch: /mobile\.spec\.js/,
    },
  ],
});
