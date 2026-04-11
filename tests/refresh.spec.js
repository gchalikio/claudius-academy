// @ts-nocheck
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

/**
 * Regression coverage for the bugs fixed in main.js:
 *   1. A refresh on a hash-routed URL should NOT replay the intro.
 *   2. The nav counter should reflect the real slide on first paint
 *      (not the "1 / 1" placeholder from index.html).
 */
test.describe("refresh + boot ordering", () => {
  test("hash on load skips the intro entirely", async ({ page }) => {
    await page.goto("/?deck=examples#/list-example");
    await expect(page.locator('.slide[data-slide-id="list-example"].is-active')).toBeVisible();
    // The intro element should be hidden because the hash short-circuits it.
    await expect(page.locator("#intro")).toBeHidden();
  });

  test("counter reflects current slide immediately, not placeholder", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/list-example");
    await expect(page.locator('.slide[data-slide-id="list-example"].is-active')).toBeVisible();
    const counter = await page.locator("#nav-counter").textContent();
    const expected = await page.evaluate(() => {
      const i = window.SLIDES.findIndex((s) => s.id === "list-example");
      return `${i + 1} / ${window.SLIDES.length}`;
    });
    expect(counter.trim()).toBe(expected);
  });

  test("counter on first slide is N / total, never the literal placeholder", async ({ page }) => {
    await page.goto("/?deck=examples&nointro");
    await expect(page.locator(".slide.is-active")).toBeVisible();
    const counter = await page.locator("#nav-counter").textContent();
    const total = await page.evaluate(() => window.SLIDES.length);
    expect(counter.trim()).toBe(`1 / ${total}`);
  });

  test("hash refresh at a non-zero step lands on that step", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/list-example/2");
    await expect(page.locator('.slide[data-slide-id="list-example"].is-active')).toBeVisible();
    expect(await page.evaluate(() => window.Router.step)).toBe(2);
    await expect(page.locator("#nav-step")).toHaveText(/step 2 \/ 3/);
  });

  test("?nointro alone (no hash) starts on the first slide", async ({ page }) => {
    await page.goto("/?deck=examples&nointro");
    await expect(page.locator("#intro")).toBeHidden();
    expect(await page.evaluate(() => window.Router.index)).toBe(0);
  });

  test("clearing the hash and revisiting starts from slide 0", async ({ page }) => {
    // Walk a few slides forward — hash will accumulate state.
    await page.goto("/?deck=examples&nointro");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect(await page.evaluate(() => window.Router.index)).toBeGreaterThan(0);

    // Now visit the deck URL with no hash. This must reset to slide 0
    // (no localStorage fallback). Regression for the resume bug.
    await page.goto("/?deck=examples&nointro");
    expect(await page.evaluate(() => window.Router.index)).toBe(0);
  });
});
