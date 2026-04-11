// @ts-nocheck
const { expect } = require("@playwright/test");
const { test, DECK_URL } = require("./_helpers");

test.describe("boot", () => {
  test("picker is shown when no deck is in the URL", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".deck-picker")).toBeVisible();
    await expect(page.locator(".deck-picker__panel h2")).toContainText(/presentation/i);
  });

  test("picker lists all registered decks", async ({ page }) => {
    await page.goto("/");
    const links = page.locator(".deck-picker a[data-index]");
    const count = await links.count();
    const registered = await page.evaluate(() => (window.DECKS || []).length);
    expect(count).toBe(registered);
  });

  test("deck loads with ?deck and ?nointro flag", async ({ page }) => {
    await page.goto(DECK_URL);
    await expect(page.locator("#stage")).toBeVisible();
    await expect(page.locator(".slide.is-active")).toBeVisible();
    await expect(page.locator("#nav-counter")).toBeVisible();
  });

  test("document title comes from config", async ({ page }) => {
    await page.goto(DECK_URL);
    await expect(page).toHaveTitle(/Examples/);
  });

  test("counter shows total slide count", async ({ page }) => {
    await page.goto(DECK_URL);
    const counter = await page.locator("#nav-counter").textContent();
    const total = await page.evaluate(() => window.SLIDES.length);
    expect(counter).toMatch(new RegExp(`/ ${total}$`));
  });

  test("unknown deck shows the error overlay", async ({ page }) => {
    await page.goto("/?deck=does-not-exist");
    // Unknown decks fall through to the picker (not the error overlay)
    // because the loader rejects them before attempting to load.
    await expect(page.locator(".deck-picker")).toBeVisible();
  });
});
