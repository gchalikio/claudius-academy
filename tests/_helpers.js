// @ts-nocheck
const { test } = require("@playwright/test");

/**
 * Shared fixture: every test gets a `consoleErrors` array that auto-asserts
 * empty after the test, plus a helper to navigate to the deck without intro.
 */
// The optional gitignored local decks registry is allowed to 404.
// It's a feature, not an error: presentations/local/decks.js exists only
// for users with personal decks. Filter its 404 + the bare network failure
// out of the console-error assertion.
const isExpected404 = (text) =>
  /presentations\/local\/decks\.js/.test(text) ||
  /Failed to load resource: the server responded with a status of 404/.test(text);

const errorTest = test.extend({
  page: async ({ page }, use) => {
    /** @type {string[]} */
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpected404(msg.text())) {
        errors.push(msg.text());
      }
    });
    page.on("requestfailed", (req) => {
      const url = req.url();
      if (!/presentations\/local\/decks\.js/.test(url)) {
        errors.push(`requestfailed: ${url}`);
      }
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
