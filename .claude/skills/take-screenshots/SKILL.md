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

| File                              | What it captures                        |
| --------------------------------- | --------------------------------------- |
| `docs/screenshots/intro.png`      | The Claudius intro animation (mid-anim) |
| `docs/screenshots/slide.png`      | A representative text slide             |
| `docs/screenshots/diagram.png`    | The fullscreen progressive diagram      |
| `docs/screenshots/code-modal.png` | The code snippet modal open with tabs   |
| `docs/screenshots/overview.png`   | The overview grid (`Esc` view)          |

If the README has been edited, re-check it for the exact list before
shooting.

## Steps

1. **Run the script.** Screenshot capture is fully automated via
   `scripts/take-screenshots.js` — it boots the static server on a free
   port, drives headless Chromium through the examples deck, and writes
   all 5 PNGs into `docs/screenshots/`.

   ```bash
   npm run screenshots
   ```

   First-time only: `npm install && npm run test:install` to fetch the
   chromium binary Playwright needs.

2. **What the script captures** (kept in sync with the README):

   | Shot             | How it's produced                                           |
   | ---------------- | ----------------------------------------------------------- |
   | `intro.png`      | Loads `?deck=examples`, waits 1.5s into the intro animation |
   | `slide.png`      | Jumps to `#/hello` (the canonical text slide)               |
   | `diagram.png`    | Jumps to `#/diagram-example/3` (all elements drawn)         |
   | `code-modal.png` | On `#/hello`, presses `c` to open the snippets media modal  |
   | `overview.png`   | Presses `Escape` to open the overview grid                  |

3. **If you add or rename a screenshot in the README**, update
   `scripts/take-screenshots.js` to match — add a new `shoot()` block,
   or rename the output path. Re-run `npm run screenshots` to verify.

4. **Verify the README renders.**

   ```bash
   open README.md
   ```

   (or view it on github.com after pushing). Broken image icons mean a
   filename mismatch between the README and the script output.

5. **Stop. Do NOT commit.**
   Per the global rule in `CLAUDE.md`, no skill commits or pushes
   without explicit user confirmation per operation. Report back to the
   user with the list of files added and the commit message you'd
   suggest. Wait for them to say "commit it" before running any `git`
   command.

## Don't

- Don't shoot any local-only deck (anything under `presentations/local/`).
  Those decks are gitignored; their content must not appear in the
  public repo.
- Don't include the OS chrome (window title bar, taskbar). Crop it out.
- Don't use JPEG — text and crisp UI compress poorly. PNG always.
- Don't shoot at retina without downsizing. A 5K screenshot bloats the
  repo and renders absurdly large in the README.
- Don't capture the speaker notes pane open. That's a presenter-only UI.
