---
name: take-screenshots
description: Capture the README screenshots — opens each scene the README references, takes screenshots, names them correctly, and drops them into docs/screenshots.
---

# Skill: take README screenshots

Use this when the README's Screenshots section is showing broken images
because nothing is in `docs/screenshots/` yet, or when a visual change
makes the existing screenshots out of date.

## Read first

- `README.md` — the Screenshots section, to see exactly which filenames
  are referenced
- `docs/screenshots/` — the target directory

## Filenames the README expects

| File                          | What it captures                          |
| ----------------------------- | ----------------------------------------- |
| `docs/screenshots/intro.png`  | The Claudius intro animation (mid-anim)   |
| `docs/screenshots/slide.png`  | A representative text slide               |
| `docs/screenshots/diagram.png`| The fullscreen progressive diagram        |
| `docs/screenshots/code-modal.png` | The code snippet modal open with tabs |
| `docs/screenshots/overview.png` | The overview grid (`Esc` view)          |

If the README has been edited, re-check it for the exact list before
shooting.

## Steps

1. **Use the Examples deck**, not your personal one. The screenshots
   ship in the public repo.
   ```
   index.html?deck=examples
   ```

2. **Set up a clean shooting environment.**
   - Browser at 1280×800 or larger.
   - Hide bookmarks bar (`Cmd+Shift+B` in Chrome).
   - Press `F` for fullscreen if you want a chromeless shot.
   - Make sure no DevTools panel is open.
   - Make sure the timer (`T`) and notes (`N`) are *closed*.

3. **Capture each shot in turn.**

   **`intro.png`**
   - Reload `index.html?deck=examples` (no `?nointro`).
   - Wait until the title types out and the laurels glow.
   - Take the shot before the screen fades.

   **`slide.png`**
   - Navigate to the `hello` slide (any text slide will do).
   - Take a shot of the full slide area.

   **`diagram.png`**
   - Navigate to `diagram-example`.
   - Press `→` until all 3 elements are drawn.
   - Take a shot.

   **`code-modal.png`**
   - On the `hello` slide, press `C`.
   - Make sure both tabs are visible (`config.js`, `deck.js`).
   - Take a shot of the modal panel.

   **`overview.png`**
   - Press `Esc` from any slide.
   - Take a shot showing several cards.

4. **Crop and downsize if needed.**
   - Aim for 1600×1000 max — the README renders at half that size.
   - PNG, no transparency needed.
   - Strip metadata if you care about repo size.

5. **Drop them in `docs/screenshots/`** with the exact filenames above.

6. **Verify the README renders.**
   ```bash
   open README.md
   ```
   (or view it on github.com after pushing). Broken image icons mean a
   filename mismatch.

7. **Stop. Do NOT commit.**
   Per the global rule in `CLAUDE.md`, no skill commits or pushes
   without explicit user confirmation per operation. Report back to the
   user with the list of files added and the commit message you'd
   suggest. Wait for them to say "commit it" before running any `git`
   command.

## Don't

- Don't shoot the personal `claudius-academy` deck. It's gitignored;
  the screenshots go in the public repo.
- Don't include the OS chrome (window title bar, taskbar). Crop it out.
- Don't use JPEG — text and crisp UI compress poorly. PNG always.
- Don't shoot at retina without downsizing. A 5K screenshot bloats the
  repo and renders absurdly large in the README.
- Don't capture the speaker notes pane open. That's a presenter-only UI.
