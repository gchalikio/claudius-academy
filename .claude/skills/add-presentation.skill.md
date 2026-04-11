---
name: add-presentation
description: Author a brand new presentation deck for the Claudius Academy engine — copies the examples folder, edits config + slides, registers the deck.
---

# Skill: add a new presentation

Use this when the user wants to start a brand new talk in this repo.

## Read first

- `CLAUDE.md` — project rules (no build step, engine vs content separation)
- `README.md` — slide builder reference
- `presentations/examples/` — the deck to copy

## Steps

1. **Confirm the deck name and id with the user.**
   - Suggest a kebab-case id (e.g. `intro-to-rust`, `q4-review`).
   - Ask whether the deck should be **public** (committed to the repo) or
     **personal** (gitignored — only registered in `presentations/local.js`).

2. **Copy the examples folder.**
   ```bash
   cp -r presentations/examples presentations/<deck-id>
   ```

3. **Edit `presentations/<deck-id>/config.js`:**
   - `documentTitle` — browser tab text
   - `intro.title`, `intro.subtitle`, `intro.logo` (point at the new
     `presentations/<deck-id>/assets/logo.svg` if you have a custom logo)
   - `intro.autoAdvanceMs` if you want a different intro length
   - `theme` — any CSS variable from `css/theme.css` to retheme
   - `fonts` — only if shipping custom fonts (drop `.woff2` files into
     `presentations/<deck-id>/assets/fonts/` and reference them here)
   - `stylesheet` — update to `presentations/<deck-id>/theme.css`

4. **Edit `presentations/<deck-id>/deck.js`:**
   - Replace the example slides with the real spine of the talk.
   - Use the builders documented in `README.md` (or `types.d.ts`):
     `textSlide`, `quoteSlide`, `sectionSlide`, `listSlide`, `splitSlide`,
     `compareSlide`, `bigTextSlide`, `imageSlide`, `diagramSlide`.
   - Every slide needs a unique `id`.
   - Add `notes:` to every slide that benefits from speaker notes.
   - Use `sectionSlide` as act/pillar dividers; the talk feels structured.

5. **Register the deck.**

   **Public deck** → edit `presentations/index.js`:
   ```js
   window.DECKS = [
     { id: "examples", title: "Examples — every builder" },
     { id: "<deck-id>", title: "Human Title" },
   ];
   ```

   **Personal deck** → edit `presentations/local.js` (gitignored):
   ```js
   if (window.DECKS) {
     window.DECKS.push({ id: "<deck-id>", title: "Human Title" });
   }
   ```

6. **Smoke-test it locally:**
   - Open `index.html` (or `npm start`) and pick the new deck from the picker
     OR visit `index.html?deck=<deck-id>`.
   - Walk every slide with `→` and verify nothing is broken.
   - Press `Esc` to open the overview and confirm titles + ids are sensible.

7. **For public decks only — run the test suite:**
   ```bash
   npm test
   ```
   Tests target `presentations/examples`, so a new public deck shouldn't
   break them. If it does, you've likely changed something in the engine
   inadvertently — investigate.

## Don't

- Don't put deck content in `js/` or `css/`.
- Don't edit `js/builders.js` to add a slide type *for one specific deck* —
  use `Builders.register("name", factory)` from inside the deck file. Only
  add to `js/builders.js` if the new builder is genuinely reusable.
- Don't commit a personal deck to the public repo. If `presentations/<id>/`
  is meant to be local-only, add it to `.gitignore` next to the existing
  `presentations/claudius-academy/` line.
