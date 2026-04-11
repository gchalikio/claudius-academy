// @ts-nocheck
const { test } = require("@playwright/test");

/**
 * Shared fixture: every test gets a `consoleErrors` array that auto-asserts
 * empty after the test, plus a helper to navigate to the deck without intro.
 */
// Some 404s are expected by design and shouldn't trip the console-error guard:
//   - presentations/local/decks.js — gitignored optional local registry
//   - assets/videos/placeholder.mp4 — placeholder reference, drop your own
const EXPECTED_MISSING = [/presentations\/local\/decks\.js/, /assets\/videos\/placeholder\.mp4/];
const isExpectedMissing = (text) => EXPECTED_MISSING.some((rx) => rx.test(text));
const isGenericResource404 = (text) =>
  /Failed to load resource: the server responded with a status of 404/.test(text);

const errorTest = test.extend({
  page: async ({ page }, use) => {
    /** @type {string[]} */
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() !== "error") return;
      if (isExpectedMissing(text) || isGenericResource404(text)) return;
      errors.push(text);
    });
    page.on("requestfailed", (req) => {
      const url = req.url();
      if (EXPECTED_MISSING.some((rx) => rx.test(url))) return;
      errors.push(`requestfailed: ${url}`);
    });
    // @ts-expect-error attach to page so tests can read it if they want
    page.consoleErrors = errors;
    await use(page);
    if (errors.length) {
      throw new Error("Console errors during test:\n" + errors.join("\n"));
    }
  },
});

const DECK_URL = "/?deck=examples&nointro";

module.exports = { test: errorTest, DECK_URL };
