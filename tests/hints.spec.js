// @ts-nocheck
const { expect } = require("@playwright/test");
const { test, DECK_URL } = require("./_helpers");

test.describe("hints overlay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DECK_URL);
    await expect(page.locator(".slide.is-active")).toBeVisible();
  });

  test("? toggles the hints overlay", async ({ page }) => {
    await expect(page.locator("#hints")).toBeHidden();
    await page.keyboard.press("?");
    await expect(page.locator("#hints")).toBeVisible();
    await page.keyboard.press("?");
    await expect(page.locator("#hints")).toBeHidden();
  });

  test("hints overlay reflects items from config", async ({ page }) => {
    await page.keyboard.press("?");
    const hints = page.locator("#hints");
    await expect(hints.locator("h3")).toContainText(/Keys/);
    const items = await hints.locator("li").count();
    const expected = await page.evaluate(() => window.DECK_CONFIG?.hints?.items?.length || 0);
    expect(items).toBe(expected);
  });
});
