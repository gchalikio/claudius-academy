#!/usr/bin/env node
// @ts-nocheck
/*
 * Captures the README screenshots from the examples deck.
 *
 * Usage:  node scripts/take-screenshots.js
 *
 * Boots scripts/serve.js on a free port, drives a headless Chromium through
 * the examples deck, and writes 5 PNGs into docs/screenshots/. Reusable —
 * any contributor can rerun this to refresh the README images.
 *
 * Requires devDependencies: @playwright/test (already in package.json) and
 * `npm run test:install` to have downloaded the chromium binary.
 */

const { chromium } = require("@playwright/test");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs/promises");
const net = require("node:net");

const REPO_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(REPO_ROOT, "docs", "screenshots");
const VIEWPORT = { width: 1280, height: 800 };

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function startServer(port) {
  const child = spawn("node", [path.join("scripts", "serve.js"), String(port)], {
    cwd: REPO_ROOT,
    env: { ...process.env, QUIET: "1" },
    stdio: ["ignore", "ignore", "inherit"],
  });
  return child;
}

async function waitForServer(port, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await new Promise((resolve, reject) => {
        const sock = net.connect(port, "127.0.0.1");
        sock.once("connect", () => {
          sock.end();
          resolve();
        });
        sock.once("error", reject);
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`Server on port ${port} did not come up in ${timeoutMs}ms`);
}

async function shoot(page, baseURL, name, fn) {
  await fn(page, baseURL);
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✓ ${path.relative(REPO_ROOT, file)}`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const port = await findFreePort();
  const server = startServer(port);
  const baseURL = `http://127.0.0.1:${port}`;

  try {
    await waitForServer(port);

    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    const page = await context.newPage();

    console.log(`Capturing screenshots from ${baseURL}/?deck=examples`);

    // intro.png — mid-animation, after title has typed in
    await shoot(page, baseURL, "intro.png", async (p, base) => {
      await p.goto(`${base}/?deck=examples`);
      await p.locator(".intro__title").waitFor({ state: "visible" });
      await p.waitForTimeout(1500);
    });

    // slide.png — a representative text slide
    await shoot(page, baseURL, "slide.png", async (p, base) => {
      await p.goto(`${base}/?deck=examples&nointro#/hello`);
      await p.locator(".slide.is-active").waitFor({ state: "visible" });
      await p.waitForTimeout(300);
    });

    // diagram.png — fullscreen progressive diagram, all 3 steps drawn
    await shoot(page, baseURL, "diagram.png", async (p, base) => {
      await p.goto(`${base}/?deck=examples&nointro#/diagram-example/3`);
      await p.locator(".slide.is-active").waitFor({ state: "visible" });
      await p.waitForTimeout(800);
    });

    // code-modal.png — code snippet modal open with tabs
    await shoot(page, baseURL, "code-modal.png", async (p, base) => {
      await p.goto(`${base}/?deck=examples&nointro#/hello`);
      await p.locator(".slide.is-active").waitFor({ state: "visible" });
      await p.keyboard.press("c");
      await p.locator('.media-kind.is-active[data-kind="snippets"]').waitFor({ state: "visible" });
      await p.waitForTimeout(300);
    });

    // overview.png — overview grid (Esc view)
    await shoot(page, baseURL, "overview.png", async (p, base) => {
      await p.goto(`${base}/?deck=examples&nointro`);
      await p.locator(".slide.is-active").waitFor({ state: "visible" });
      await p.locator("body").click();
      await p.keyboard.press("Escape");
      await p.locator("#overview").waitFor({ state: "visible" });
      await p.waitForTimeout(300);
    });

    await browser.close();
    console.log("Done.");
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
