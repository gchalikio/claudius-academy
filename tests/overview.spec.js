// @ts-nocheck
const { expect } = require("@playwright/test");
const { test, DECK_URL } = require("./_helpers");

test.describe("overview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DECK_URL);
    await expect(page.locator(".slide.is-active")).toBeVisible();
  });

  test("Esc opens overview, Esc closes it", async ({ page }) => {
    await page.keyboard.press("Escape");
    await expect(page.locator("#overview")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#overview")).toBeHidden();
  });

  test("overview has one card per slide", async ({ page }) => {
    await page.keyboard.press("Escape");
    const cards = await page.locator(".ov-card").count();
    const total = await page.evaluate(() => window.SLIDES.length);
    expect(cards).toBe(total);
  });

  test("clicking a card jumps to that slide", async ({ page }) => {
    await page.keyboard.press("Escape");
    await page.locator(".ov-card").nth(2).click();
    await expect(page.locator("#overview")).toBeHidden();
    await expect(page.locator("#nav-counter")).toContainText(/^3 \//);
  });

  test("Enter on a highlighted card jumps to it", async ({ page }) => {
    await page.keyboard.press("Escape");
    // Active starts at the current slide (index 0)
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.locator("#overview")).toBeHidden();
    await expect(page.locator("#nav-counter")).toContainText(/^2 \//);
  });

  test("Esc does not open overview while a modal is open", async ({ page }) => {
    await page.keyboard.press("v");
    await expect(page.locator("#video-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#video-modal")).toBeHidden();
    await expect(page.locator("#overview")).toBeHidden();
  });
});
