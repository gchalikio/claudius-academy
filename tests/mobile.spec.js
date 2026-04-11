// @ts-nocheck
/**
 * Mobile-specific tests. Runs against the iPhone 13 device descriptor
 * (390x844, hasTouch: true, isMobile: true). Configured in
 * playwright.config.js as the `mobile` project.
 */
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

const DECK = "/?deck=examples&nointro";

/**
 * Helper: synthesize a horizontal swipe on a locator.
 *
 * Playwright doesn't ship a swipe primitive and Chromium doesn't expose
 * the WebKit-only `Touch`/`TouchEvent` constructors, so we dispatch plain
 * Event objects with a touches/changedTouches shim attached. Our touch.js
 * handler only reads `e.touches[0].clientX/Y` and `e.changedTouches[0].*`,
 * which is exactly what the shim provides.
 */
async function swipe(page, locator, dx) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("locator has no bounding box");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.evaluate(
    ({ startX, startY, dx }) => {
      const target = document.elementFromPoint(startX, startY);
      if (!target) return;
      const fakeTouch = (cx) => ({ clientX: cx, clientY: startY, identifier: 1, target });
      const start = new Event("touchstart", { bubbles: true });
      Object.defineProperty(start, "touches", { value: [fakeTouch(startX)] });
      Object.defineProperty(start, "targetTouches", { value: [fakeTouch(startX)] });
      Object.defineProperty(start, "changedTouches", { value: [fakeTouch(startX)] });
      target.dispatchEvent(start);

      const end = new Event("touchend", { bubbles: true });
      Object.defineProperty(end, "touches", { value: [] });
      Object.defineProperty(end, "targetTouches", { value: [] });
      Object.defineProperty(end, "changedTouches", { value: [fakeTouch(startX + dx)] });
      target.dispatchEvent(end);
    },
    { startX, startY, dx }
  );
}

test.describe("mobile viewport", () => {
  test("viewport is the iPhone 13 size, not desktop", async ({ page }) => {
    await page.goto(DECK);
    const size = page.viewportSize();
    expect(size.width).toBeLessThan(500);
    expect(size.height).toBeGreaterThan(500);
  });

  test("first slide renders without horizontal overflow", async ({ page }) => {
    await page.goto(DECK);
    await expect(page.locator(".slide.is-active")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
    }));
    expect(overflow.docW).toBeLessThanOrEqual(overflow.winW + 1);
  });

  test("nav buttons meet 44px tap-target floor", async ({ page }) => {
    await page.goto(DECK);
    await expect(page.locator(".nav__btn--next")).toBeVisible();
    const box = await page.locator(".nav__btn--next").boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("tapping the next nav button advances the slide", async ({ page }) => {
    await page.goto(DECK);
    await expect(page.locator("#nav-counter")).toContainText(/^1 \//);
    await page.locator(".nav__btn--next").tap();
    await expect(page.locator("#nav-counter")).toContainText(/^2 \//);
  });

  test("swipe left on the stage advances to the next slide", async ({ page }) => {
    await page.goto(DECK);
    await expect(page.locator(".slide.is-active")).toBeVisible();
    await swipe(page, page.locator("#stage"), -200);
    await expect(page.locator("#nav-counter")).toContainText(/^2 \//);
  });

  test("swipe right on the stage goes back", async ({ page }) => {
    await page.goto(DECK);
    await page.locator(".nav__btn--next").tap();
    await expect(page.locator("#nav-counter")).toContainText(/^2 \//);
    await swipe(page, page.locator("#stage"), 200);
    await expect(page.locator("#nav-counter")).toContainText(/^1 \//);
  });

  test("split slide stacks vertically (single column)", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/split-example");
    await expect(page.locator('.slide[data-slide-id="split-example"].is-active')).toBeVisible();
    const tracks = await page.locator(".slide--split .split").evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns.split(" ").length;
    });
    expect(tracks).toBe(1);
  });

  test("compare slide stacks vertically", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/compare-example");
    await expect(page.locator('.slide[data-slide-id="compare-example"].is-active')).toBeVisible();
    const tracks = await page.locator(".slide--compare .compare").evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns.split(" ").length;
    });
    expect(tracks).toBe(1);
  });

  test("media modal goes full-bleed (panel covers viewport width)", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await expect(page.locator('.slide[data-slide-id="hello"].is-active')).toBeVisible();
    await page.evaluate(() => window.Media.open("snippets"));
    await expect(page.locator("#media-modal")).toBeVisible();
    const widths = await page.evaluate(() => ({
      panel: document.querySelector("#media-modal .modal__panel").getBoundingClientRect().width,
      win: window.innerWidth,
    }));
    // ≥95% of the viewport — "full-bleed" intent. The small gap is the
    // visual viewport / scrollbar reservation in chromium mobile emulation.
    expect(widths.panel).toBeGreaterThanOrEqual(widths.win * 0.95);
  });

  test("media modal kind buttons are tappable and switch kind", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.evaluate(() => window.Media.open("snippets"));
    await page.locator('.media-kind[data-kind="images"]').tap();
    await expect(page.locator(".media-kind.is-active")).toHaveAttribute("data-kind", "images");
  });

  test("picker fits the viewport without horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".deck-picker")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      panelW: document.querySelector(".deck-picker__panel").getBoundingClientRect().width,
      winW: window.innerWidth,
    }));
    expect(overflow.panelW).toBeLessThanOrEqual(overflow.winW);
  });

  test("overview opens via Media tap path and renders multi-card grid", async ({ page }) => {
    await page.goto(DECK);
    await page.evaluate(() => window.Overview.open());
    await expect(page.locator("#overview")).toBeVisible();
    const cards = await page.locator(".ov-card").count();
    expect(cards).toBeGreaterThan(1);
  });

  test("hash refresh on mobile lands on the right slide", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/list-example");
    await expect(page.locator('.slide[data-slide-id="list-example"].is-active')).toBeVisible();
  });

  test("base font scales down on mobile", async ({ page }) => {
    await page.goto(DECK);
    const fontSize = await page.evaluate(
      () => parseFloat(getComputedStyle(document.body).fontSize) || 0
    );
    expect(fontSize).toBeLessThanOrEqual(17);
  });

  test("swipe is suppressed while the media modal is open", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.evaluate(() => window.Media.open("snippets"));
    const before = await page.evaluate(() => window.Router.index);
    await swipe(page, page.locator("#media-modal"), -200);
    const after = await page.evaluate(() => window.Router.index);
    expect(after).toBe(before);
  });
});
