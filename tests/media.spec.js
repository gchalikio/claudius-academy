// @ts-nocheck
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

/**
 * Detailed coverage of the unified Media modal:
 *   - per-slide + global merging across all three kinds
 *   - tab switching via ←/→
 *   - kind selector buttons in the header
 *   - mutual exclusion with overview
 *   - close via backdrop / X button
 *   - empty state on slides without items of the current kind
 */
test.describe("media modal", () => {
  test.describe("snippets kind", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/?deck=examples&nointro#/hello");
      await expect(page.locator('.slide[data-slide-id="hello"].is-active')).toBeVisible();
    });

    test("merges per-slide snippets with global snippets", async ({ page }) => {
      await page.keyboard.press("c");
      // hello has 2 local snippets; the deck has 1 global snippet → 3 tabs total.
      const tabs = page.locator(".media-tab");
      await expect(tabs).toHaveCount(3);
      await expect(tabs.nth(0)).toHaveText(/config\.js/);
      await expect(tabs.nth(1)).toHaveText(/deck\.js/);
      await expect(tabs.nth(2)).toHaveText(/global hint/);
    });

    test("renders syntax-highlighted code", async ({ page }) => {
      await page.keyboard.press("c");
      await expect(page.locator(".media-snippet__body")).toBeVisible();
      await expect(page.locator(".media-snippet__body ol li").first()).toBeVisible();
    });

    test("ArrowRight cycles through snippet tabs", async ({ page }) => {
      await page.keyboard.press("c");
      await expect(page.locator(".media-tab.is-active")).toHaveText(/config\.js/);
      await page.keyboard.press("ArrowRight");
      await expect(page.locator(".media-tab.is-active")).toHaveText(/deck\.js/);
      await page.keyboard.press("ArrowRight");
      await expect(page.locator(".media-tab.is-active")).toHaveText(/global hint/);
      await page.keyboard.press("ArrowRight");
      // Wraps back to first
      await expect(page.locator(".media-tab.is-active")).toHaveText(/config\.js/);
    });

    test("clicking a tab activates it", async ({ page }) => {
      await page.keyboard.press("c");
      await page.locator(".media-tab").nth(2).click();
      await expect(page.locator(".media-tab.is-active")).toHaveText(/global hint/);
    });
  });

  test.describe("images kind (gallery)", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/?deck=examples&nointro#/hello");
      await expect(page.locator('.slide[data-slide-id="hello"].is-active')).toBeVisible();
    });

    test("merges per-slide images with global images", async ({ page }) => {
      await page.keyboard.press("i");
      // hello has 2 per-slide images; deck has 1 global image → 3 tabs.
      await expect(page.locator(".media-tab")).toHaveCount(3);
    });

    test("renders the active image and updates on tab change", async ({ page }) => {
      await page.keyboard.press("i");
      await expect(page.locator(".media-image__img")).toBeVisible();
      const firstSrc = await page.locator(".media-image__img").getAttribute("src");
      expect(firstSrc).toMatch(/sample-1/);
      await page.keyboard.press("ArrowRight");
      const secondSrc = await page.locator(".media-image__img").getAttribute("src");
      expect(secondSrc).toMatch(/sample-2/);
    });

    test("image caption is shown when configured", async ({ page }) => {
      await page.keyboard.press("i");
      await expect(page.locator(".media-caption")).toContainText(/first per-slide image/);
    });
  });

  test.describe("videos kind", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/?deck=examples&nointro#/hello");
      await expect(page.locator('.slide[data-slide-id="hello"].is-active')).toBeVisible();
    });

    test("merges per-slide video with global video", async ({ page }) => {
      await page.keyboard.press("v");
      // hello has 1 local video; deck has 1 global video → 2 tabs.
      await expect(page.locator(".media-tab")).toHaveCount(2);
    });

    test("renders a <video> element with the configured source", async ({ page }) => {
      await page.keyboard.press("v");
      const video = page.locator('[data-testid="media-video-el"]');
      await expect(video).toBeVisible();
      const srcAttr = await video.locator("source").getAttribute("src");
      expect(srcAttr).toMatch(/placeholder\.mp4/);
    });
  });

  test.describe("kind selector buttons", () => {
    test("clicking a kind button switches kinds without closing", async ({ page }) => {
      await page.goto("/?deck=examples&nointro#/hello");
      await page.keyboard.press("c");
      await page.locator('.media-kind[data-kind="images"]').click();
      await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "images");
      await expect(page.locator("#media-modal")).toBeVisible();
    });

    test("all three kind buttons are present in the header", async ({ page }) => {
      await page.goto("/?deck=examples&nointro#/hello");
      await page.keyboard.press("c");
      await expect(page.locator(".media-kind")).toHaveCount(3);
    });
  });

  test.describe("close paths", () => {
    test("clicking the backdrop closes the modal", async ({ page }) => {
      await page.goto("/?deck=examples&nointro#/hello");
      await page.keyboard.press("c");
      // Dispatch the click programmatically — the panel covers most of the
      // backdrop visually, so a real-mouse click would land on the panel.
      // We just want to verify the data-action handler is wired.
      await page.evaluate(() => document.querySelector("#media-modal .modal__backdrop").click());
      await expect(page.locator("#media-modal")).toBeHidden();
    });

    test("clicking the X button closes the modal", async ({ page }) => {
      await page.goto("/?deck=examples&nointro#/hello");
      await page.keyboard.press("c");
      await page.locator("#media-modal .modal__close").click();
      await expect(page.locator("#media-modal")).toBeHidden();
    });
  });

  test.describe("empty state and global-only fallback", () => {
    test("a slide with no per-slide items still shows the global items", async ({ page }) => {
      // The 'quote-example' slide has no per-slide media at all, but the
      // deck registers one global item per kind, so each kind should show 1 tab.
      await page.goto("/?deck=examples&nointro#/quote-example");
      await page.keyboard.press("c");
      await expect(page.locator(".media-tab")).toHaveCount(1);
      await expect(page.locator(".media-tab.is-active")).toHaveText(/global hint/);
      await page.keyboard.press("i");
      await expect(page.locator(".media-tab")).toHaveCount(1);
      await page.keyboard.press("v");
      await expect(page.locator(".media-tab")).toHaveCount(1);
    });
  });

  test("Esc closes media modal before opening overview", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.keyboard.press("c");
    await page.keyboard.press("Escape");
    await expect(page.locator("#media-modal")).toBeHidden();
    await expect(page.locator("#overview")).toBeHidden();
  });
});
