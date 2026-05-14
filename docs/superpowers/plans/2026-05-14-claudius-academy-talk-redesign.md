# Claudius Academy talk redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a 40-minute, 27-slide version of the Claudius Academy talk for tomorrow, with two new engine builders (`mediaSlide`, `qrSlide`) and three new content beats (concrete-prompt LLM cycle, non-devs, repo outro).

**Architecture:** The engine is vanilla JS, no build step. Each engine file is one IIFE attaching one global. Builders compose via `baseSlide(opts, type, extra)`. Adding a builder means: edit `js/builders.js`, add CSS, register an example slide in `presentations/examples/deck.js`, add a Playwright test, update `types.d.ts` and the README. Per CLAUDE.md hard rule #6, all four must change together.

**Tech Stack:** Vanilla JS (no bundler), vanilla CSS with `--var` tokens, Playwright + Chromium for tests, JSDoc + tsconfig for types.

**Project rules to obey:**
- Never commit, stage, or push without explicit per-operation user confirmation (CLAUDE.md hard rule #7 + global preference). Plan steps that would commit are wrapped as "PROPOSE COMMIT" — the engineer pauses and waits for user.
- No build step, no runtime deps, no ES modules, no new globals.
- Update tests + types + README + examples whenever a builder is added.

---

## File Map

**Engine (touched):**
- `js/builders.js` — add `mediaSlide(opts)` and `qrSlide(opts)`; export both
- `css/slide.css` — add `.slide--media`, `.slide--media .media-placeholder`, `.slide--qr`, `.qr-frame` styles
- `types.d.ts` — add type hints for both builders
- `README.md` — extend the builder reference section
- `presentations/examples/config.js` and `presentations/examples/deck.js` — add example `mediaSlide` (no media → placeholder) and `qrSlide` so tests have a target
- `presentations/examples/assets/qr-placeholder.svg` — small placeholder QR (a static SVG square is fine for the test fixture)
- `tests/builders.spec.js` — add tests for `mediaSlide` (placeholder visible) and `qrSlide` (qr image + url + tagline visible)

**Talk deck (rewritten):**
- `presentations/local/claudius-academy/deck.js` — primary content edits
- `presentations/local/claudius-academy/PLAN.md` — refresh to match new structure
- `presentations/local/claudius-academy/config.js` — bump `timer.target` from 50 → 40
- `presentations/local/claudius-academy/assets/repo-qr.svg` — actual QR for the repo URL (user generates; placeholder text-SVG until then)

**Out of scope:** No changes to `js/diagram.js`, `js/router.js`, `js/media.js`, `js/loader.js`, or other engine internals. No new key bindings. No new URL params.

---

## Task 1: Add `mediaSlide` builder

The builder is essentially `textSlide` with two extras: it always shows hint chrome for V/I (only the ones that have content), and renders a labelled placeholder card in the slide body when neither `videos` nor `images` is provided.

**Files:**
- Modify: `js/builders.js` (add `mediaSlide` function; add to the `window.Builders` export object)
- Modify: `css/slide.css` (append `.slide--media` rules)
- Modify: `presentations/examples/deck.js` (register one example `mediaSlide` near the existing `imageSlide` example, id `media-example-empty`, with no videos/images — the placeholder case is what we need to test; also register the slide entry in slides array)
- Test: `tests/builders.spec.js` (new test below)

- [ ] **Step 1: Write the failing test**

Append to `tests/builders.spec.js` (inside the `test.describe("slide builders", ...)` block, before the closing `});`):

```js
test("mediaSlide renders placeholder card when no media is wired", async ({ page }) => {
  await page.goto("/?deck=examples&nointro#/media-example-empty");
  const slide = page.locator('.slide[data-slide-id="media-example-empty"].is-active');
  await expect(slide).toBeVisible();
  await expect(slide).toHaveClass(/slide--media/);
  await expect(slide.locator(".media-placeholder")).toBeVisible();
  await expect(slide.locator(".media-placeholder")).toContainText(/TODO|placeholder/i);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/builders.spec.js -g "mediaSlide renders placeholder" --reporter=line`
Expected: FAIL (slide id `media-example-empty` does not exist yet).

- [ ] **Step 3: Add the `mediaSlide` builder to `js/builders.js`**

In `js/builders.js`, after the `compareSlide` function (around line 302) and before the `window.Builders = { ... }` block, add:

```js
  /**
   * mediaSlide — a text-frame slide whose payload is a recorded demo.
   * Pass `videos` and/or `images` for the V / I modals. When neither is
   * provided, render a labelled placeholder card so the slide is never
   * blank or broken on stage.
   *
   *   mediaSlide({
   *     id, eyebrow, title, body,
   *     videos: [...],   // optional — V opens the video modal
   *     images: [...],   // optional — I opens the image modal
   *     placeholder: "Demo placeholder — record before the talk",
   *   })
   */
  function mediaSlide(opts) {
    const { title, body, videos, images, placeholder } = opts;
    const hasMedia = (videos && videos.length) || (images && images.length);
    const placeholderHtml = hasMedia
      ? ""
      : `<div class="media-placeholder">
           <div class="media-placeholder__icon">▶</div>
           <div class="media-placeholder__label">${placeholder || "Demo placeholder — record before the talk"}</div>
         </div>`;
    const hintHtml = hasMedia
      ? `<p class="media-hints">
           ${videos && videos.length ? "press <kbd>V</kbd> for the recording" : ""}
           ${videos && videos.length && images && images.length ? " · " : ""}
           ${images && images.length ? "press <kbd>I</kbd> for stills" : ""}
         </p>`
      : "";
    return baseSlide(opts, "media", {
      title,
      render(root) {
        root.classList.add("slide--media");
        root.innerHTML = `
          ${slideHeader(opts)}
          <div class="slide__body">
            ${body || ""}
            ${placeholderHtml}
            ${hintHtml}
          </div>
        `;
      },
    });
  }
```

Then add `mediaSlide` to the `window.Builders = { ... }` export object (around line 304), in the same alphabetical-ish ordering used today:

```js
  window.Builders = {
    textSlide,
    quoteSlide,
    diagramSlide,
    imageSlide,
    sectionSlide,
    listSlide,
    splitSlide,
    bigTextSlide,
    compareSlide,
    mediaSlide,

    // ... existing register/_baseSlide/_slideHeader untouched
```

- [ ] **Step 4: Add CSS for `.slide--media` placeholder**

Append to `css/slide.css`:

```css
/* mediaSlide — body + optional placeholder card */
.slide--media .media-placeholder {
  margin-top: 2em;
  padding: 2em 2.5em;
  border: 2px dashed var(--gold-700, #b8902f);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1.5em;
  background: rgba(216, 178, 82, 0.08);
}
.slide--media .media-placeholder__icon {
  font-size: 2.5em;
  color: var(--gold-700, #b8902f);
  opacity: 0.7;
}
.slide--media .media-placeholder__label {
  font-style: italic;
  color: var(--gold-700, #b8902f);
  font-size: 1.1em;
}
.slide--media .media-hints {
  margin-top: 1.5em;
  color: var(--gold-700, #b8902f);
}
.slide--media .media-hints kbd {
  font-family: inherit;
  padding: 0.1em 0.4em;
  border: 1px solid currentColor;
  border-radius: 4px;
}
```

- [ ] **Step 5: Add an empty-media example slide so the test has a target**

In `presentations/examples/deck.js`, find the destructure block (`const { textSlide, ... } = window.Builders;`) and add `mediaSlide` to it. Then insert a new slide entry (e.g. just before the `imageSlide` entry near line 115):

```js
mediaSlide({
  id: "media-example-empty",
  eyebrow: "Demo",
  title: "mediaSlide — placeholder mode",
  body: "<p>When you haven't wired media yet, the slide shows a placeholder card so nothing breaks on stage.</p>",
  placeholder: "TODO — placeholder demo",
}),
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx playwright test tests/builders.spec.js -g "mediaSlide renders placeholder" --reporter=line`
Expected: PASS.

- [ ] **Step 7: Run the full builders suite to catch regressions**

Run: `npx playwright test tests/builders.spec.js --reporter=line`
Expected: all existing tests still pass.

- [ ] **Step 8: Update `types.d.ts`**

Find the existing builder type declarations and add a `MediaSlideOpts` interface and a `mediaSlide` entry on the `Builders` namespace. Match the existing style — if other builders declare `{ id: string; title?: string; ... }`, follow that pattern. Add:

```ts
interface MediaSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  videos?: Array<{ title: string; src: string }>;
  images?: Array<{ title: string; src: string; alt?: string }>;
  placeholder?: string;
  notes?: string;
  snippets?: Array<{ title: string; lang?: string; code: string; highlight?: number[] }>;
}
```

And on the `Builders` interface add: `mediaSlide(opts: MediaSlideOpts): SlideConfig;`

(If `types.d.ts` has different conventions, copy the conventions of the nearest existing builder declaration — do NOT invent a new shape.)

- [ ] **Step 9: Update README builder reference**

Find the section in `README.md` that lists builders (search for `### bigTextSlide` or `compareSlide` to find it). Add a `### mediaSlide` entry after `imageSlide` with the same structure as neighbouring entries — one paragraph of prose, one fenced code block showing the usage, listing the opts (`id`, `eyebrow`, `title`, `body`, `videos`, `images`, `placeholder`).

- [ ] **Step 10: PROPOSE COMMIT**

Stop. Show the user:

```
Files changed:
  js/builders.js
  css/slide.css
  presentations/examples/deck.js
  tests/builders.spec.js
  types.d.ts
  README.md

Proposed commit:
  feat: add mediaSlide builder with placeholder fallback

OK to stage and commit?
```

Wait for explicit user OK before running any `git add` / `git commit`.

---

## Task 2: Add `qrSlide` builder

A specialised layout: big QR image on one side, URL + tagline on the other. QR is a static image path (`qrSrc`), not generated at runtime (locked decision in the spec — see "Engine additions" section).

**Files:**
- Modify: `js/builders.js`
- Modify: `css/slide.css`
- Modify: `presentations/examples/deck.js` and add asset `presentations/examples/assets/qr-placeholder.svg`
- Modify: `tests/builders.spec.js`
- Modify: `types.d.ts`, `README.md`

- [ ] **Step 1: Write the failing test**

Append inside `test.describe("slide builders", ...)` in `tests/builders.spec.js`:

```js
test("qrSlide renders qr image, url, and tagline", async ({ page }) => {
  await page.goto("/?deck=examples&nointro#/qr-example");
  const slide = page.locator('.slide[data-slide-id="qr-example"].is-active');
  await expect(slide).toBeVisible();
  await expect(slide).toHaveClass(/slide--qr/);
  await expect(slide.locator(".qr-frame__img")).toBeVisible();
  await expect(slide.locator(".qr-url")).toContainText("github.com");
  await expect(slide.locator(".qr-tagline")).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/builders.spec.js -g "qrSlide renders" --reporter=line`
Expected: FAIL (slide id does not exist).

- [ ] **Step 3: Create the placeholder QR SVG asset**

Create `presentations/examples/assets/qr-placeholder.svg` with this content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <rect width="100" height="100" fill="#fff"/>
  <rect x="10" y="10" width="20" height="20" fill="#000"/>
  <rect x="70" y="10" width="20" height="20" fill="#000"/>
  <rect x="10" y="70" width="20" height="20" fill="#000"/>
  <rect x="40" y="40" width="20" height="20" fill="#000"/>
  <text x="50" y="55" font-size="6" text-anchor="middle" fill="#fff" font-family="monospace">QR</text>
</svg>
```

This is just a visual stand-in — the real QR for the talk lives in the deck folder.

- [ ] **Step 4: Add the `qrSlide` builder to `js/builders.js`**

In `js/builders.js`, after `mediaSlide` (added in Task 1) and before the `window.Builders = { ... }` block, add:

```js
  /**
   * qrSlide — big QR + URL + tagline, sized for back-of-room visibility.
   * QR is a static image path (see spec; runtime generation rejected by
   * the no-runtime-deps rule).
   *
   *   qrSlide({
   *     id, eyebrow, title,
   *     url:     "https://github.com/.../claudius-academy",
   *     qrSrc:   `${window.DECK_PATH}/assets/repo-qr.svg`,
   *     tagline: "Fork it. Make it yours.",
   *   })
   */
  function qrSlide(opts) {
    const { eyebrow, title, url, qrSrc, tagline } = opts;
    return baseSlide(opts, "qr", {
      title: title || url || "QR",
      render(root) {
        root.classList.add("slide--qr");
        root.innerHTML = `
          ${slideHeader({ eyebrow, title })}
          <div class="qr">
            <div class="qr-frame">
              <img class="qr-frame__img" src="${qrSrc}" alt="QR code for ${url || ""}" />
            </div>
            <div class="qr-meta">
              <div class="qr-url">${url || ""}</div>
              ${tagline ? `<div class="qr-tagline">${tagline}</div>` : ""}
            </div>
          </div>
        `;
      },
    });
  }
```

Then add `qrSlide` to the `window.Builders = { ... }` export object alongside `mediaSlide`.

- [ ] **Step 5: Add CSS for `.slide--qr`**

Append to `css/slide.css`:

```css
/* qrSlide — big QR on the left, URL + tagline on the right */
.slide--qr .qr {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3em;
  align-items: center;
  margin-top: 1.5em;
}
.slide--qr .qr-frame {
  background: #fff;
  padding: 1.5em;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.slide--qr .qr-frame__img {
  width: 320px;
  height: 320px;
  display: block;
}
.slide--qr .qr-url {
  font-family: var(--font-mono, monospace);
  font-size: 1.4em;
  word-break: break-all;
  color: var(--gold-700, #b8902f);
}
.slide--qr .qr-tagline {
  margin-top: 1em;
  font-size: 1.6em;
  font-style: italic;
  color: var(--ink-900, #1a1a1a);
}
@media (max-width: 720px) {
  .slide--qr .qr {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .slide--qr .qr-frame__img {
    width: 220px;
    height: 220px;
  }
}
```

- [ ] **Step 6: Register an example `qrSlide` in `presentations/examples/deck.js`**

Add `qrSlide` to the destructure block, then add a slide entry:

```js
qrSlide({
  id: "qr-example",
  eyebrow: "Outro",
  title: "Fork this deck",
  url: "https://github.com/example/claudius-academy",
  qrSrc: `${window.DECK_PATH}/assets/qr-placeholder.svg`,
  tagline: "Make it yours.",
}),
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx playwright test tests/builders.spec.js -g "qrSlide renders" --reporter=line`
Expected: PASS.

- [ ] **Step 8: Run the full test suite**

Run: `npx playwright test --reporter=line`
Expected: all tests pass.

- [ ] **Step 9: Update `types.d.ts`**

Add:

```ts
interface QrSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  url: string;
  qrSrc: string;
  tagline?: string;
  notes?: string;
}
```

And on the `Builders` interface: `qrSlide(opts: QrSlideOpts): SlideConfig;`

- [ ] **Step 10: Update README**

Add a `### qrSlide` entry next to `mediaSlide` in the README builder reference, with the same structure as neighbouring entries.

- [ ] **Step 11: PROPOSE COMMIT**

Stop. Show the user:

```
Proposed commit:
  feat: add qrSlide builder for repo/outro slides

OK to stage and commit?
```

Wait for explicit user OK.

---

## Task 3: Rewrite the mental-model section in the talk deck

Replace the existing two-slide mental model with three slides: keep the existing `llm-mental-model` bigText, insert a new `llm-prompts` diagram showing two prompts through the same cycle, keep the existing `llm-loop` diagram as the "consequence" slide.

**Files:**
- Modify: `presentations/local/claudius-academy/deck.js`

- [ ] **Step 1: Read the current state**

Open `presentations/local/claudius-academy/deck.js`. The current mental-model section is lines 69–107 (the `bigTextSlide` with id `llm-mental-model` then the `diagramSlide` with id `llm-loop`). Leave both. Insert the new diagram between them.

- [ ] **Step 2: Insert the new `llm-prompts` diagramSlide**

Insert between the `llm-mental-model` bigTextSlide and the `llm-loop` diagramSlide:

```js
diagramSlide({
  id: "llm-prompts",
  fullscreen: true,
  viewBox: { width: 1600, height: 900 },
  steps: [
    // Phase A — weak prompt
    { type: "node", id: "promptA", shape: "rect", x: 200, y: 200, w: 320, h: 100, label: '"this color in this div\nis wrong, should be black"' },
    { type: "node", id: "ctxA", shape: "ellipse", x: 700, y: 200, rx: 90, ry: 50, label: "tiny context" },
    { type: "arrow", from: "promptA", to: "ctxA", curve: 0 },
    { type: "node", id: "modelA", shape: "ellipse", x: 1050, y: 200, rx: 110, ry: 50, label: "MODEL" },
    { type: "arrow", from: "ctxA", to: "modelA", curve: 0 },
    { type: "node", id: "outA", shape: "rect", x: 1380, y: 200, w: 200, h: 100, label: '"confident guess at\n*some* div"' },
    { type: "arrow", from: "modelA", to: "outA", curve: 0 },
    // Phase B — strong prompt
    { type: "node", id: "promptB", shape: "rect", x: 200, y: 700, w: 320, h: 120, label: '"In Button.tsx:42,\ntext-danger-700 should\nbe text-danger-900 per Figma"' },
    { type: "node", id: "ctxB", shape: "ellipse", x: 700, y: 700, rx: 160, ry: 90, label: "rich context", accent: true },
    { type: "arrow", from: "promptB", to: "ctxB", curve: 0 },
    { type: "node", id: "modelB", shape: "ellipse", x: 1050, y: 700, rx: 110, ry: 50, label: "MODEL" },
    { type: "arrow", from: "ctxB", to: "modelB", curve: 0 },
    { type: "node", id: "outB", shape: "rect", x: 1380, y: 700, w: 220, h: 100, label: '"right line, right token"', accent: true },
    { type: "arrow", from: "modelB", to: "outB", curve: 0 },
  ],
  notes: `Walk through Phase A first — vague prompt, tiny context blob,
the model has nothing to anchor on, output is a confident guess at the
wrong div. Then Phase B — same model, same loop, but the context blob
swells visibly because the prompt names the file, the line, the token,
and the spec. The output is precise.

The point: same machine, different input. The audience watches the
context node grow.`,
}),
```

**Note:** the `rect` and `w`/`h` props need to be supported by `js/diagram.js`. Before writing the slide, run `grep -n "shape:" js/diagram.js` to confirm. If `rect` is not supported, fall back to `ellipse` with appropriate `rx`/`ry` for the prompt/output nodes. **Verify first; do not assume.**

- [ ] **Step 3: Smoke test the new slide**

Run `npm start` (or the project's local-serve equivalent — `python3 -m http.server` from repo root also works) and navigate to `index.html?deck=claudius-academy&nointro#/llm-prompts`. Step through it. Confirm no console errors, nodes appear in order, both phases are readable.

If `rect` isn't supported and you fell back to `ellipse`, adjust label widths so they don't overflow.

- [ ] **Step 4: PROPOSE COMMIT**

```
Proposed commit:
  feat(deck): two-prompt LLM cycle slide

OK?
```

---

## Task 4: Trim Skills, Autonomy, Discipline

Apply the three cuts decided in the spec.

**Files:**
- Modify: `presentations/local/claudius-academy/deck.js`

- [ ] **Step 1: Skills — cut `skills-compose` and convert `skills-demo-intro` to `mediaSlide`**

In `deck.js`:
- Remove the entire `splitSlide({ id: "skills-compose", ... })` block (currently lines ~245–267).
- Change the next slide from `textSlide({ id: "skills-demo-intro", ... })` to `mediaSlide({ id: "skills-demo", ... })`. Keep eyebrow, title, body, notes. Replace the `TODO: press V...` body line with: `body: "<p>Two of the workflow skills I lean on every day.</p><p style=\"margin-top:1em\">Each one is a methodology I used to run in my head, turned into a button.</p>"`. Add `placeholder: "Skills demo — record before talk"`.
- Add `mediaSlide` to the destructure at the top of the file.

- [ ] **Step 2: Autonomy — cut `autonomy-demo-intro`**

Remove the entire `textSlide({ id: "autonomy-demo-intro", ... })` block (currently around lines 366–378). The diagram + the merge-gate slide carry the section now.

- [ ] **Step 3: Discipline — collapse `discipline-cost` into `discipline-tools`**

Remove the `textSlide({ id: "discipline-cost", ... })` block (lines ~381–392). In the surviving `textSlide({ id: "discipline-tools", ... })`, edit the body to lead with the "today they're cheap" framing:

```js
body: `<p><strong>Today tokens are cheap. Tomorrow they may not be.</strong></p>
<p style="margin-top:1em">Build for the world where every token costs.</p>
<ul style="margin-top:1.5em">
  <li><strong>rtk</strong> — a proxy that strips token-bloat
  out of shell output before Claude reads it</li>
  <li><strong>Explore agent</strong> — read-only investigation,
  cheaper than letting the main agent thrash</li>
  <li><strong>Plan mode</strong> — think before writing code</li>
</ul>
<p style="margin-top:1em">The list will change in six months.
The principle won't: <strong>cheapest viable path first.</strong></p>`,
```

Also rename the slide eyebrow if it helps — e.g. `eyebrow: "Discipline"` instead of `"Tools that keep you honest"`.

- [ ] **Step 4: Context demo — also convert to `mediaSlide`**

Find `textSlide({ id: "context-demo-intro", ... })` (around lines 175–191). Change to `mediaSlide({ id: "context-demo", ... })`, keep eyebrow/title/notes, replace the `TODO: press V/I/C` line in the body with a clean intro paragraph, add `placeholder: "Context demo — record before talk"`. Remove the trailing TODO comment block — the placeholder fallback handles the empty case.

- [ ] **Step 5: Smoke test**

Step through the whole deck. Confirm: no slide id appears twice, no slide is broken, the deck loads without console errors. Use `npx playwright test tests/boot.spec.js --reporter=line` if the boot test runs against a deck — otherwise just navigate manually.

- [ ] **Step 6: PROPOSE COMMIT**

```
Proposed commit:
  refactor(deck): trim Skills/Autonomy/Discipline to fit 40 min

OK?
```

---

## Task 5: Add the Non-devs section (2 slides)

Insert between Discipline and Close.

**Files:**
- Modify: `presentations/local/claudius-academy/deck.js`

- [ ] **Step 1: Insert the `compareSlide`**

After the Discipline section (after the trimmed `discipline-tools` slide), before the Close section (`listSlide` with id `principles`), insert:

```js
/* ─── Non-devs ──────────────────────────────────────── */
compareSlide({
  id: "non-devs-inputs",
  eyebrow: "Beyond your editor",
  title: "Your team is your context pipeline",
  left: {
    title: "What lands in your queue today",
    items: [
      "Tickets with no links",
      "Figma files no one labelled",
      "Slack threads with no log refs",
      "“It doesn't work” bug reports",
    ],
  },
  right: {
    title: "When your team gets it",
    items: [
      "Tickets with Honeycomb traces",
      "Figma frames named by component",
      "Slack threads linking the PR",
      "Bug reports with reproductions",
    ],
  },
  notes: `The point: every collaborator is a Claude user, whether they
know it or not. Your leverage isn't your prompts — it's what arrives in
your queue. Teach your PMs, designers, support, ops to write for Claude
and your inputs get richer for free.`,
}),
```

- [ ] **Step 2: Insert the `textSlide` follow-up**

Immediately after:

```js
textSlide({
  id: "non-devs-teach",
  eyebrow: "The compounding move",
  title: "Teach your team to write for Claude",
  body: `<p>PMs. Designers. Support. Ops.</p>
  <p style="margin-top:1em">Each one is a Claude user — whether they
  know it or not.</p>
  <p style="margin-top:1em">When their outputs get Claude-shaped, your
  inputs do too. <strong>That's compounding.</strong></p>`,
  notes: `Land the takeaway: the biggest unlock isn't your prompts.
It's the shape of the work that arrives at your desk. Small nudges
upstream pay off downstream for the rest of your year.`,
}),
```

- [ ] **Step 3: Smoke test**

Navigate to `#/non-devs-inputs` and `#/non-devs-teach`. Confirm both render, transition cleanly, no console errors.

- [ ] **Step 4: PROPOSE COMMIT**

```
Proposed commit:
  feat(deck): add Non-devs section

OK?
```

---

## Task 6: Add the Repo outro slide

A single `qrSlide` between the Close `listSlide` and the final `bigTextSlide`.

**Files:**
- Modify: `presentations/local/claudius-academy/deck.js`
- Create: `presentations/local/claudius-academy/assets/repo-qr.svg` (placeholder; user replaces with real QR)

- [ ] **Step 1: Add `qrSlide` to the destructure block**

At the top of `deck.js`, add `qrSlide` to the `const { ... } = window.Builders;` destructure.

- [ ] **Step 2: Create the placeholder QR asset**

Create `presentations/local/claudius-academy/assets/repo-qr.svg` with the same content as the placeholder in Task 2 Step 3 (just so the slide isn't broken). Add a comment in `deck.js` reminding the user to replace this with a real QR.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">
  <rect width="100" height="100" fill="#fff"/>
  <rect x="10" y="10" width="20" height="20" fill="#000"/>
  <rect x="70" y="10" width="20" height="20" fill="#000"/>
  <rect x="10" y="70" width="20" height="20" fill="#000"/>
  <rect x="40" y="40" width="20" height="20" fill="#000"/>
  <text x="50" y="55" font-size="6" text-anchor="middle" fill="#fff" font-family="monospace">QR</text>
</svg>
```

- [ ] **Step 3: Insert the slide**

In `deck.js`, between the `listSlide({ id: "principles", ... })` and the final `bigTextSlide({ id: "takeaway-return", ... })`, insert:

```js
/* ─── Repo outro ────────────────────────────────────── */
qrSlide({
  id: "repo-outro",
  eyebrow: "This deck",
  title: "Claudius Academy",
  // TODO: replace url + qrSrc with the real repo URL and a real QR.
  // Generate the QR offline (any QR site, save as SVG/PNG) and drop
  // it into assets/repo-qr.svg.
  url: "https://github.com/YOUR-HANDLE/claudius-academy",
  qrSrc: `${window.DECK_PATH}/assets/repo-qr.svg`,
  tagline: "Engine + skills + slides. Mostly built by Claude. Fork it.",
  notes: `The meta-proof slide. Everything you just saw — the engine,
the skills, every slide — is on GitHub, and most of it was written by
Claude under my supervision. Don't copy my setup. Fork the engine,
write your own skills, find what fits YOU. Then Q&A.`,
}),
```

- [ ] **Step 4: Smoke test**

Navigate to `#/repo-outro`. Confirm placeholder QR is visible, URL is readable from the back of the room (zoom out if needed to simulate), tagline is visible.

- [ ] **Step 5: PROPOSE COMMIT**

```
Proposed commit:
  feat(deck): add Claudius Academy repo outro

OK?
```

---

## Task 7: Refresh PLAN.md and timer

**Files:**
- Modify: `presentations/local/claudius-academy/PLAN.md`
- Modify: `presentations/local/claudius-academy/config.js`

- [ ] **Step 1: Update timer target**

In `presentations/local/claudius-academy/config.js`, change:

```js
timer: {
  show: false,
  target: 50,
},
```

to:

```js
timer: {
  show: false,
  target: 40,
},
```

- [ ] **Step 2: Rewrite PLAN.md to reflect the new structure**

Edit `PLAN.md`:
- Update the "Roughly 45 min + 15 min Q&A" line to "Roughly 40 min + 15 min Q&A".
- Update the Structure section to match the 27-slide layout from the spec (Opener 2, Mental model 3, Context 5, Skills 4, Rules 3, Autonomy 3, Discipline 2, Non-devs 2, Repo outro 1, Close 2).
- Replace the "Slide count (23 total)" section with "Slide count (27 total)" and the new breakdown.
- Add a "Non-devs" subsection with one line describing the two slides.
- Add a "Repo outro" subsection mentioning the qrSlide.
- Update the Decisions list: bump time budget to 40 + 15.
- Update the Artifacts list: Context demo and Skills demo still TBD (now via mediaSlide placeholder); Autonomy demo is no longer required (slide cut); add "Repo QR + URL" as a new artifact to fill in.

Do not invent — copy the structure from the spec at `docs/superpowers/specs/2026-05-14-claudius-academy-talk-redesign.md` section "Structure".

- [ ] **Step 3: PROPOSE COMMIT**

```
Proposed commit:
  docs(deck): update PLAN.md and timer for 40-min target

OK?
```

---

## Task 8: Full deck smoke test + rehearsal

**Files:**
- None modified — verification only.

- [ ] **Step 1: Run the full Playwright suite**

Run: `npx playwright test --reporter=line`
Expected: all tests pass.

- [ ] **Step 2: Manual front-to-back walkthrough**

Start a local server (`python3 -m http.server 8080` from repo root, or `npm start` if defined). Open `http://localhost:8080/?deck=claudius-academy`. Step through every slide using Right arrow. Check:
- No console errors (open DevTools).
- All slide ids are unique (no router warnings).
- Every diagram steps cleanly.
- Both `mediaSlide` placeholder cards render where expected.
- The `qrSlide` renders QR + URL + tagline.
- Slide count at the end matches 27.

- [ ] **Step 3: Time a dry run**

Press `T` to show the timer. Run through the deck speaking the speaker notes aloud (or in your head). Confirm total time lands at 35–40 min — if longer, identify which section is bloating and decide whether to trim further (out of scope for this plan but worth flagging).

- [ ] **Step 4: List remaining placeholders**

Make a list of artifacts still to fill before the talk:
- Real QR for `presentations/local/claudius-academy/assets/repo-qr.svg`
- Real repo URL in `repo-outro` slide
- Optional: Context demo media (mediaSlide will show placeholder if not provided)
- Optional: Skills demo media (same)

Present the list to the user. Do NOT attempt to generate any of these — the user fills them in.

- [ ] **Step 5: No commit at this step**

Verification-only. No file changes.

---

## Self-Review

**Spec coverage:**
- mediaSlide → Task 1 ✓
- qrSlide → Task 2 ✓
- Two-prompt LLM diagram → Task 3 ✓
- Skills trim → Task 4 ✓
- Autonomy trim → Task 4 ✓
- Discipline merge → Task 4 ✓
- Non-devs section → Task 5 ✓
- Repo outro → Task 6 ✓
- PLAN.md + timer update → Task 7 ✓
- Smoke test → Task 8 ✓

**Open questions resolved:**
- Which Skills slide to cut: cut `skills-compose` (per spec default).
- QR generator: static image path (locked in spec).
- Two-prompt diagram: one slide, two phases (one diagramSlide with all steps).

**Placeholder scan:** No TBDs in the plan. Every code step shows the exact code or the exact instruction.

**Type consistency:** `mediaSlide` and `qrSlide` consistently use the same opt names everywhere (`videos`/`images`/`placeholder`, `url`/`qrSrc`/`tagline`). The example slide ids match the test slide ids. The destructure additions in `deck.js` match the builders exported in Task 1 and Task 2.

**Risk flag:** Task 3 Step 2 assumes the diagram engine supports `rect` shapes — the instruction explicitly says to verify with `grep` before writing the code and fall back to `ellipse` if not. This is the only place the plan would touch unknown engine territory; everywhere else uses documented builder patterns.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-14-claudius-academy-talk-redesign.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Each `PROPOSE COMMIT` step pauses for your explicit OK before any git operation.

2. **Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints for review.

**Which approach?**
