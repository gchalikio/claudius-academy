// @ts-nocheck
const { expect } = require("@playwright/test");
const { test, DECK_URL } = require("./_helpers");

test.describe("navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DECK_URL);
    await expect(page.locator(".slide.is-active")).toBeVisible();
  });

  test("right arrow advances", async ({ page }) => {
    const counter = page.locator("#nav-counter");
    await expect(counter).toContainText(/^1 \//);
    await page.keyboard.press("ArrowRight");
    await expect(counter).toContainText(/^2 \//);
  });

  test("left arrow goes back", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#nav-counter")).toContainText(/^2 \//);
  });

  test("space also advances", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.locator("#nav-counter")).toContainText(/^2 \//);
  });

  test("hash reflects current slide", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toMatch(/^#\/[a-z0-9-]+/);
  });

  test("hash routing on load lands on the right slide", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/list-example");
    await expect(page.locator('.slide[data-slide-id="list-example"].is-active')).toBeVisible();
  });

  test("Shift+Right skips internal steps to next slide", async ({ page }) => {
    // Diagram-example has 3 internal steps
    await page.goto("/?deck=examples&nointro#/diagram-example");
    await expect(page.locator('.slide[data-slide-id="diagram-example"].is-active')).toBeVisible();
    const before = await page.evaluate(() => window.Router.index);
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.up("Shift");
    const after = await page.evaluate(() => window.Router.index);
    expect(after).toBe(before + 1);
  });

  test("nav buttons (prev/next) work like the keys", async ({ page }) => {
    await page.locator('[data-action="next"]').click();
    await expect(page.locator("#nav-counter")).toContainText(/^2 \//);
    await page.locator('[data-action="prev"]').click();
    await expect(page.locator("#nav-counter")).toContainText(/^1 \//);
  });

  test("Shift+0 leaves the deck and returns to the picker", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Shift+0");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".deck-picker")).toBeVisible();
  });

  test("Home key also returns to the picker", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Home");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".deck-picker")).toBeVisible();
  });

  test("right at the last slide is a no-op", async ({ page }) => {
    const total = await page.evaluate(() => window.SLIDES.length);
    await page.evaluate((n) => window.Router.goTo(n - 1, 0), total);
    await page.keyboard.press("ArrowRight");
    const idx = await page.evaluate(() => window.Router.index);
    expect(idx).toBe(total - 1);
  });
});
