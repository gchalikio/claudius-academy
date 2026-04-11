// @ts-nocheck
const { expect } = require("@playwright/test");
const { test, DECK_URL } = require("./_helpers");

test.describe("modals + side panels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DECK_URL);
    await expect(page.locator(".slide.is-active")).toBeVisible();
  });

  test("V opens video modal, Esc closes it", async ({ page }) => {
    await page.keyboard.press("v");
    await expect(page.locator("#video-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#video-modal")).toBeHidden();
  });

  test("C opens code modal on a slide that has snippets", async ({ page }) => {
    // The 'hello' slide in the examples deck carries two snippets.
    await page.goto("/?deck=examples&nointro#/hello");
    await expect(page.locator('.slide[data-slide-id="hello"].is-active')).toBeVisible();
    await page.keyboard.press("c");
    await expect(page.locator("#code-modal")).toBeVisible();
    await expect(page.locator(".code-tab")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(page.locator("#code-modal")).toBeHidden();
  });

  test("code modal — number key jumps to that snippet tab", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/hello");
    await page.keyboard.press("c");
    await page.keyboard.press("2");
    await expect(page.locator(".code-tab.is-active")).toHaveText(/deck\.js/);
  });

  test("opening C while V is open closes V (mutually exclusive)", async ({ page }) => {
    await page.keyboard.press("v");
    await expect(page.locator("#video-modal")).toBeVisible();
    await page.keyboard.press("c");
    await expect(page.locator("#video-modal")).toBeHidden();
    await expect(page.locator("#code-modal")).toBeVisible();
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
