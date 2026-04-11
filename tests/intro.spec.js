// @ts-nocheck
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

test.describe("intro sequence", () => {
  test("intro shows when there's no ?nointro and no hash", async ({ page }) => {
    await page.goto("/?deck=examples");
    await expect(page.locator("#intro")).toBeVisible();
    await expect(page.locator(".intro__title")).toBeVisible();
  });

  test("a key press skips the intro", async ({ page }) => {
    await page.goto("/?deck=examples");
    await expect(page.locator("#intro")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#intro")).toBeHidden();
    await expect(page.locator(".slide.is-active")).toBeVisible();
  });

  test("clicking the intro skips it", async ({ page }) => {
    await page.goto("/?deck=examples");
    await expect(page.locator("#intro")).toBeVisible();
    await page.locator("#intro").click();
    await expect(page.locator("#intro")).toBeHidden();
    await expect(page.locator(".slide.is-active")).toBeVisible();
  });

  test("intro applies title and subtitle from config", async ({ page }) => {
    await page.goto("/?deck=examples");
    await expect(page.locator(".intro__title")).toHaveText("EXAMPLES");
    await expect(page.locator(".intro__subtitle")).toHaveText("every builder");
  });
});
