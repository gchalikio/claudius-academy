// @ts-nocheck
const { expect } = require("@playwright/test");
const { test } = require("./_helpers");

test.describe("diagram", () => {
  test("steps add nodes/arrows progressively", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/diagram-example");
    await expect(page.locator('.slide[data-slide-id="diagram-example"].is-active')).toBeVisible();

    expect(await page.locator(".diagram .node").count()).toBe(0);
    expect(await page.locator(".diagram .arrow").count()).toBe(0);

    // Step 1: input node
    await page.keyboard.press("ArrowRight");
    expect(await page.locator(".diagram .node").count()).toBe(1);

    // Step 2: output node
    await page.keyboard.press("ArrowRight");
    expect(await page.locator(".diagram .node").count()).toBe(2);

    // Step 3: arrow input → output
    await page.keyboard.press("ArrowRight");
    expect(await page.locator(".diagram .arrow").count()).toBe(1);
  });

  test("stepping back removes the most recent element", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/diagram-example");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect(await page.locator(".diagram .node").count()).toBe(2);
    await page.keyboard.press("ArrowLeft");
    expect(await page.locator(".diagram .node").count()).toBe(1);
  });

  test("hash refresh at a non-zero step replays the diagram", async ({ page }) => {
    await page.goto("/?deck=examples&nointro#/diagram-example/3");
    await expect(page.locator('.slide[data-slide-id="diagram-example"].is-active')).toBeVisible();
    expect(await page.locator(".diagram .node").count()).toBe(2);
    expect(await page.locator(".diagram .arrow").count()).toBe(1);
  });
});
