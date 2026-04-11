// @ts-nocheck
const { test } = require("@playwright/test");

/**
 * Shared fixture: every test gets a `consoleErrors` array that auto-asserts
 * empty after the test, plus a helper to navigate to the deck without intro.
 */
const errorTest = test.extend({
  page: async ({ page }, use) => {
    /** @type {string[]} */
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
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
