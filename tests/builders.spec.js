// @ts-nocheck
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

/**
 * One test per built-in slide builder. Each test jumps directly to the
 * relevant slide via hash routing and asserts the rendered DOM contains
 * the visual hooks the builder is supposed to produce.
 */
test.describe("slide builders", () => {
  test("sectionSlide renders numeral, eyebrow, title, subtitle", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/intro");
    const slide = page.locator('.slide[data-slide-id="intro"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--section/);
    await expect(slide.locator(".section__numeral")).toHaveText("I");
    await expect(slide.locator(".section__eyebrow")).toHaveText(/Act One/);
    await expect(slide.locator(".section__title")).toHaveText(/opener/i);
    await expect(slide.locator(".section__subtitle")).toBeVisible();
  });

  test("textSlide renders eyebrow, title, body", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    const slide = page.locator('.slide[data-slide-id="hello"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--text/);
    await expect(slide.locator(".slide__eyebrow")).toHaveText(/Welcome/);
    await expect(slide.locator(".slide__title")).toHaveText(/Hello world/);
    await expect(slide.locator(".slide__body")).toContainText(/textSlide/);
  });

  test("listSlide reveals one item per step", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/list-example");
    const slide = page.locator('.slide[data-slide-id="list-example"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--list/);
    const items = slide.locator(".list__item");
    await expect(items).toHaveCount(3);
    expect(await items.locator(".is-revealed").count()).toBe(0);

    await page.keyboard.press("ArrowRight");
    await expect(items.nth(0)).toHaveClass(/is-revealed/);

    await page.keyboard.press("ArrowRight");
    await expect(items.nth(1)).toHaveClass(/is-revealed/);

    await page.keyboard.press("ArrowLeft");
    await expect(items.nth(1)).not.toHaveClass(/is-revealed/);
  });

  test("splitSlide renders two columns", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/split-example");
    const slide = page.locator('.slide[data-slide-id="split-example"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--split/);
    await expect(slide.locator(".split__col")).toHaveCount(2);
  });

  test("compareSlide renders wrong + right columns with items", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/compare-example");
    const slide = page.locator('.slide[data-slide-id="compare-example"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--compare/);
    await expect(slide.locator(".compare__col--wrong")).toBeVisible();
    await expect(slide.locator(".compare__col--right")).toBeVisible();
    expect(await slide.locator(".compare__col--wrong li").count()).toBe(3);
    expect(await slide.locator(".compare__col--right li").count()).toBe(3);
  });

  test("quoteSlide renders blockquote and citation", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/quote-example");
    const slide = page.locator('.slide[data-slide-id="quote-example"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--quote/);
    await expect(slide.locator("blockquote")).toContainText(/idea/i);
    await expect(slide.locator("cite")).toContainText(/anonymous/);
  });

  test("bigTextSlide renders text and footnote", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/bigtext-example");
    const slide = page.locator('.slide[data-slide-id="bigtext-example"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--bigtext/);
    await expect(slide.locator(".bigtext")).toBeVisible();
    await expect(slide.locator(".bigtext__foot")).toBeVisible();
  });

  test("imageSlide renders image and toggles X overlay on step", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/image-example");
    const slide = page.locator('.slide[data-slide-id="image-example"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--image/);
    await expect(slide.locator(".image-frame__img")).toBeVisible();
    await expect(slide).not.toHaveClass(/is-x/);
    await page.keyboard.press("ArrowRight");
    await expect(slide).toHaveClass(/is-x/);
    await page.keyboard.press("ArrowLeft");
    await expect(slide).not.toHaveClass(/is-x/);
  });

  test("diagramSlide fullscreen has no eyebrow/title chrome", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/diagram-example");
    const slide = page.locator('.slide[data-slide-id="diagram-example"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--diagram-fullscreen/);
    expect(await slide.locator(".slide__eyebrow").count()).toBe(0);
    expect(await slide.locator(".slide__title").count()).toBe(0);
    await expect(slide.locator(".diagram-wrap svg")).toBeVisible();
  });

  test("only one slide carries is-active at a time", async ({ page }) => {
    await page.goto("/?deck=examples&nointro");
    await expect(page.locator(".slide.is-active")).toHaveCount(1);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".slide.is-active")).toHaveCount(1);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".slide.is-active")).toHaveCount(1);
  });

  test("step counter shows step N / total when on a stepped slide", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/list-example");
    await expect(page.locator('.slide[data-slide-id="list-example"].is-active')).toBeVisible();
    await expect(page.locator("#nav-step")).toHaveText(/step 0 \/ 3/);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#nav-step")).toHaveText(/step 1 \/ 3/);
  });

  test("step counter is empty on a static (no-step) slide", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/quote-example");
    await expect(page.locator('.slide[data-slide-id="quote-example"].is-active')).toBeVisible();
    await expect(page.locator("#nav-step")).toHaveText("");
  });

  test("progress bar advances as the index grows", async ({ page }) => {
    await page.goto("/?deck=examples&nointro");
    const bar = page.locator("#progress-bar");
    const startWidth = await bar.evaluate((el) => el.style.width);
    await page.keyboard.down("Shift");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.up("Shift");
    const laterWidth = await bar.evaluate((el) => el.style.width);
    expect(parseFloat(laterWidth)).toBeGreaterThan(parseFloat(startWidth) || 0);
  });

  test("mediaSlide renders placeholder card when no media is wired", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/media-example-empty");
    const slide = page.locator('.slide[data-slide-id="media-example-empty"].is-active');
    await expect(slide).toBeVisible();
    await expect(slide).toHaveClass(/slide--media/);
    await expect(slide.locator(".media-placeholder")).toBeVisible();
    await expect(slide.locator(".media-placeholder")).toContainText(/TODO|placeholder/i);
  });
});
