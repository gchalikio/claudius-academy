---
name: setup-locally
description: First-time setup after cloning the Claudius Academy repo — gets the user from `git clone` to a running picker, with tests installed and an optional `local.js` for personal decks.
---

# Skill: set up locally

Use this when the user has just cloned the repo and wants to start using it.

## Read first

- `README.md` — Quick start section
- `CLAUDE.md` — project rules (especially: no build step)

## Steps

1. **Confirm the user is in the repo root.**

   ```bash
   ls index.html package.json README.md
   ```

   If any of these are missing, they're in the wrong directory.

2. **Open the deck.**
   - **Option A — file://**: Open `index.html` directly. Works in modern
     browsers, but the dynamic deck loader needs the picker to live in the
     same directory tree, which is fine for `file://`.
   - **Option B — local server (recommended):**

     ```bash
     python3 -m http.server 8000
     ```

     Then visit <http://localhost:8000>.

   When the picker shows, the engine is working.

3. **Install test tooling (one-time).**

   ```bash
   npm install
   npm run test:install     # downloads chromium for Playwright
   ```

   Skip this only if the user explicitly says they will not run tests.

4. **Run the test suite to confirm a clean baseline.**

   ```bash
   npm test
   ```

   All tests should pass on a fresh clone. If anything fails, do NOT
   proceed to authoring — open the `fix-a-bug` skill instead.

5. **Optional — set up the personal-deck folder.**
   `presentations/local/` is gitignored — anything inside it stays on
   the user's machine. Create it only if the user wants a
   personal/work-only deck:

   ```bash
   mkdir -p presentations/local
   ```

   Then create `presentations/local/decks.js` to register their decks:

   ```js
   // presentations/local/decks.js
   if (window.DECKS) {
     window.DECKS.push({
       id: "my-personal-talk",
       title: "My Personal Talk",
       local: true,
     });
   }
   ```

   The deck files themselves go under
   `presentations/local/my-personal-talk/`. The `local: true` flag tells
   the loader to look there instead of `presentations/<id>/`.

6. **Smoke-test from the picker.**
   - Pick the **Examples** deck.
   - Walk every slide with `→`.
   - Press `V`, `C`, `N`, `T`, `Esc`, `?` and confirm each works.

## Don't

- Don't run `npm install` if the user says they only want to _present_
  (no testing). The engine itself never needs `node_modules`.
- Don't `cd` into the repo on the user's behalf without showing the path.
- Don't suggest a global install of Playwright. The repo's local
  install is sufficient.
