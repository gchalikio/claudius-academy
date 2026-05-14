// @ts-nocheck
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

test.describe("diagram", () => {
  test("steps add nodes/arrows progressively", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/diagram-example");
    await expect(page.locator('.slide[data-slide-id="diagram-example"].is-active')).toBeVisible();

    // The first step is drawn on entry so it doesn't consume a press.
    expect(await page.locator(".diagram .node").count()).toBe(1);
    expect(await page.locator(".diagram .arrow").count()).toBe(0);

    // Press 1: second node
    await page.keyboard.press("ArrowRight");
    expect(await page.locator(".diagram .node").count()).toBe(2);

    // Press 2: arrow input → output
    await page.keyboard.press("ArrowRight");
    expect(await page.locator(".diagram .arrow").count()).toBe(1);
  });

  test("stepping back removes the most recent element", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/diagram-example");
    // Entry already shows the first node; one press adds the second.
    await page.keyboard.press("ArrowRight");
    expect(await page.locator(".diagram .node").count()).toBe(2);
    await page.keyboard.press("ArrowLeft");
    expect(await page.locator(".diagram .node").count()).toBe(1);
  });

  test("hash refresh at a non-zero step replays the diagram", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/diagram-example/2");
    await expect(page.locator('.slide[data-slide-id="diagram-example"].is-active')).toBeVisible();
    expect(await page.locator(".diagram .node").count()).toBe(2);
    expect(await page.locator(".diagram .arrow").count()).toBe(1);
  });
});
