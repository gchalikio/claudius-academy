// @ts-nocheck
const { expect } = require("@playwright/test");
const { test, DECK_URL } = require("./_helpers");

/**
 * Side panel modals (notes, timer) and the unified media modal entry points.
 * Detailed media coverage lives in media.spec.js.
 */
test.describe("modals + side panels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DECK_URL);
    await expect(page.locator(".slide.is-active")).toBeVisible();
  });

  test("V opens the media modal in videos kind, Esc closes it", async ({ page }) => {
    await page.keyboard.press("v");
    await expect(page.locator("#media-modal")).toBeVisible();
    await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "videos");
    await page.keyboard.press("Escape");
    await expect(page.locator("#media-modal")).toBeHidden();
  });

  test("C opens the media modal in snippets kind on a slide that has snippets", async ({
    page,
  }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await expect(page.locator('.slide[data-slide-id="hello"].is-active')).toBeVisible();
    await page.keyboard.press("c");
    await expect(page.locator("#media-modal")).toBeVisible();
    await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "snippets");
    // hello has 2 snippets + 1 global → 3 tabs
    await expect(page.locator(".media-tab")).toHaveCount(3);
    await page.keyboard.press("Escape");
    await expect(page.locator("#media-modal")).toBeHidden();
  });

  test("I opens the media modal in images kind on a slide with images", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.keyboard.press("i");
    await expect(page.locator("#media-modal")).toBeVisible();
    await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "images");
    await expect(page.locator(".media-image__img").first()).toBeVisible();
  });

  test("number key jumps to that tab inside media modal", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.keyboard.press("c");
    await page.keyboard.press("2");
    await expect(page.locator(".media-tab.is-active")).toHaveText(/deck\.js/);
  });

  test("pressing the same kind key while open closes the modal", async ({ page }) => {
    await page.keyboard.press("v");
    await expect(page.locator("#media-modal")).toBeVisible();
    await page.keyboard.press("v");
    await expect(page.locator("#media-modal")).toBeHidden();
  });

  test("pressing a different kind key while open switches kinds", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.keyboard.press("c");
    await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "snippets");
    await page.keyboard.press("i");
    await expect(page.locator("#media-modal")).toBeVisible();
    await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "images");
    await page.keyboard.press("v");
    await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "videos");
  });

  test("N toggles speaker notes", async ({ page }) => {
    await page.keyboard.press("n");
    await expect(page.locator("#notes")).toBeVisible();
    await page.keyboard.press("n");
    await expect(page.locator("#notes")).toBeHidden();
  });

  test("notes pane reflects the current slide's notes", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.keyboard.press("n");
    await expect(page.locator("#notes .notes__body")).toContainText(/.+/);
  });

  test("T toggles timer", async ({ page }) => {
    await page.keyboard.press("t");
    await expect(page.locator("#timer")).toBeVisible();
    await page.keyboard.press("t");
    await expect(page.locator("#timer")).toBeHidden();
  });
});
