---
name: add-feature
description: Add a new engine feature (key binding, modal, side panel, config option, URL flag, lifecycle hook) — keeps the rules in CLAUDE.md, wires every required file, and ships it with a test.
---

# Skill: add a new engine feature

Use this when the user wants a new engine-level feature that isn't a
slide type. Examples:

- A new **key binding** (e.g. `P` to pause the timer)
- A new **modal or side panel** (e.g. an outline pane)
- A new **`DECK_CONFIG` option** (e.g. `intro.disableLaurel`)
- A new **URL flag** (e.g. `?theme=dark`)
- A new **router behavior** (e.g. jump-to-marked-slide)
- A new **lifecycle hook** on slides

For new slide types use `add-slide-type` instead.
For one-off custom slides in a single deck use `Builders.register()`.

## Read first

- `CLAUDE.md` — the **hard rules** at the top. Re-read them. Most
  feature mistakes come from violating one of these.
- `js/main.js` — the boot sequence; new features usually plug in here
- `js/nav.js` — for new key bindings (this is where the keymap lives)
- `js/router.js` — for new navigation behavior or lifecycle hooks
- `types.d.ts` — for new config options (extend `DeckConfig`)
- `README.md` — Configuration / Key bindings sections
- `presentations/examples/config.js` — example config used by tests

## Cross-file checklist (the hard part)

A feature that's only added in one file is half-done. **Treat every box
below as required and don't merge until each is checked or explicitly
not applicable.** Skipping items is what causes "the README says X but it
doesn't work" bugs.

- [ ] **Engine code** — the file(s) that actually implement the feature
- [ ] **CSS** — if there's any visual surface, add styles in a new
      `css/<feature>.css` and link from `index.html`
- [ ] **`js/main.js`** — call `<Feature>.init()` from `Boot.start()` if it's
      a module that needs initialisation
- [ ] **`js/nav.js`** — add the key binding(s), respecting the modal
      precedence in the existing `keydown` handler
- [ ] **`types.d.ts`** — extend `DeckConfig` (or relevant type) for any new
      config option
- [ ] **`presentations/examples/config.js`** — show the new option with a
      sensible default (commented if optional)
- [ ] **Every deck's `config.js` `hints` array** — if the feature has a
      key binding, add it to the hints
- [ ] **`index.html` `#hints` block** — same key binding listed there too
      (it's the static fallback)
- [ ] **`README.md`** — Key bindings table AND/OR Configuration list
- [ ] **`CLAUDE.md`** — add to "Public API surface" if it's a new global
      method, OR to "Anti-patterns" if there's a footgun to warn future
      contributors about
- [ ] **`tests/`** — at least one Playwright test exercising the feature
- [ ] **`CHANGELOG.md`** — add a bullet under `[Unreleased]` → `### Added`

## Steps

1. **Confirm scope with the user.**
   - What does the feature do, in one sentence?
   - Is it engine-level (lives in `js/`) or content-level (lives in a
     deck)? Engine-level features go through this skill; content-level
     ones don't need it.
   - What's the smallest possible version that delivers the value?
   - **Push back on scope creep.** A "feature" that adds five buttons,
     three config options, and a new modal is really five PRs.

2. **Find the minimal place for the engine code.**
   - **Adding to an existing module is preferred over creating a new one.**
     A new keybinding usually fits in `js/nav.js`. A new router behavior
     fits in `js/router.js`. A new config-driven flag fits where the
     config is consumed.
   - Only create a new `js/<feature>.js` file if the feature has its
     own state/lifecycle (like `js/timer.js` or `js/notes.js`). Each
     module is one IIFE attaching one global to `window`.

3. **Design the public surface first.**
   - If it's a new module, decide its global name and methods.
   - If it's a new config option, decide its key path under `DECK_CONFIG`
     and its default.
   - If it's a new key binding, pick a key that doesn't collide with
     existing ones (`→ ← Space V C N T F Esc ?` are all taken).
   - Write the API down before implementing.

4. **Implement the feature.**
   - Vanilla JS only. No `import`, no new runtime deps.
   - Each engine file is a single IIFE that attaches one global.
   - Read state from `window.DECK_CONFIG` (don't hardcode).
   - For visual features, use CSS variables from `css/theme.css`. Don't
     hardcode colors.

5. **Wire the boot sequence.**
   If the feature has an `init()` method, add the call to `Boot.start()`
   in `js/main.js` next to the existing `Modal.init() / Code.init() /
   Notes.init() / Overview.init() / Timer.init()` calls.

6. **Wire the keymap, if applicable.**
   In `js/nav.js`, add a case to the `keydown` switch. **Mind the modal
   precedence** — keys are intercepted while modals are open and you
   need to fall through correctly. Re-read the existing handler to see
   the pattern.

7. **Update `types.d.ts`** if the feature touches the config schema.
   Add the new field to `DeckConfig` (or the relevant interface) so
   editors get autocomplete.

8. **Update both hints surfaces** if the feature has a key binding:
   - **`index.html`** — the static `<aside id="hints">` block
   - **Every deck's `config.js` `hints` array** — at least the public
     `presentations/examples/config.js`. Personal decks can be updated
     by their owners.

9. **Update `README.md`** in the relevant section:
   - New key binding → add to the Key bindings table
   - New config option → add to the Configuration list
   - New URL flag → add to the URL flags section

10. **Add a Playwright test in `tests/`** that exercises the feature
    end-to-end. Existing patterns to follow:
    - Key binding → see `tests/modals.spec.js`
    - Config option → assert the consequence in `tests/boot.spec.js`
    - New modal/panel → see `tests/overview.spec.js`

11. **Update `CLAUDE.md`** if the feature introduces:
    - A new global → add it to "Public API surface"
    - A footgun future contributors might hit → add it to "Anti-patterns"

12. **Update `CHANGELOG.md`** under `[Unreleased]` → `### Added`:
    ```md
    - <Feature name>: <one-line description>.
    ```

13. **Run the test suite.**
    ```bash
    npm test
    ```
    Confirm everything passes — both your new test and the existing ones.

14. **Smoke-test in the browser.**
    - Reload `index.html?deck=examples`
    - Use the feature manually
    - Try to break it: hold Shift, open a modal first, refresh mid-flow,
      use it on a fullscreen diagram slide
    - Walk a few unrelated slides to confirm you didn't break anything

## Don't

- Don't add a feature without working through the cross-file checklist.
  Half-shipped features are the #1 source of "the docs say X" bugs.
- Don't add a new top-level global without naming it on the
  `Public API surface` section of `CLAUDE.md`.
- Don't introduce a build step, a runtime dependency, or an ES module.
- Don't add `display: <something>` to a slide CSS class without
  qualifying with `.is-active`.
- Don't add a new key binding that collides with an existing one — check
  the README's Key bindings table first.
- Don't add a config option without a sensible default. Decks shouldn't
  break when they don't set the new option.
- Don't implement a feature that *should* be configurable as
  hardcoded code. If a deck author would reasonably want to change the
  behaviour, it goes in `DECK_CONFIG`.
- Don't ship without a test. CI will catch you and a reviewer will
  reject the PR.
