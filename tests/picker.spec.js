// @ts-nocheck
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

test.describe("deck picker", () => {
  test("first link starts as active", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".deck-picker a.is-active")).toHaveCount(1);
    const idx = await page.locator(".deck-picker a.is-active").getAttribute("data-index");
    expect(idx).toBe("0");
  });

  test("ArrowDown moves the active highlight forward and wraps", async ({ page }) => {
    await page.goto("/");
    const total = await page.locator(".deck-picker a[data-index]").count();
    for (let i = 0; i < total; i++) {
      await page.keyboard.press("ArrowDown");
    }
    // After total presses we should be back at index 0 (wrap).
    const idx = await page.locator(".deck-picker a.is-active").getAttribute("data-index");
    expect(idx).toBe("0");
  });

  test("ArrowUp wraps to the last entry", async ({ page }) => {
    await page.goto("/");
    const total = await page.locator(".deck-picker a[data-index]").count();
    await page.keyboard.press("ArrowUp");
    const idx = await page.locator(".deck-picker a.is-active").getAttribute("data-index");
    expect(idx).toBe(String(total - 1));
  });

  test("Enter opens the active deck", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\?deck=/);
    await expect(page.locator(".slide.is-active, #intro:not([hidden])")).toBeVisible();
  });

  test("digit 1 jumps to the first deck", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("1");
    await expect(page).toHaveURL(/\?deck=/);
  });

  test("clicking a picker link opens that deck", async ({ page }) => {
    await page.goto("/");
    await page.locator(".deck-picker a[data-index='0']").click();
    await expect(page).toHaveURL(/\?deck=/);
  });
});
