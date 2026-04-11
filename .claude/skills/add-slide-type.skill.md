---
name: add-slide-type
description: Add a new reusable slide type to the engine — wires the builder, CSS, types, README, examples, and tests so the new type is fully integrated and discoverable.
---

# Skill: add a new slide type

Use this when the user wants a new reusable slide kind that should ship
with the engine (e.g. `timelineSlide`, `gridSlide`, `cardsSlide`).

For a one-off custom slide just for one deck, use
`Builders.register("name", factory)` from inside the deck file instead —
that doesn't need this skill.

For adding a single slide to an existing deck (using an existing type),
use the `add-slide` skill instead.

## Read first

- `js/builders.js` — every existing builder follows the same pattern
- `js/router.js` — to understand the slide config shape and lifecycle hooks
- `types.d.ts` — the type definitions you'll extend
- `README.md` — the builder reference table you'll update
- `presentations/examples/deck.js` — where the new type's example slide goes
- `tests/` — to see how existing builders are tested

## Slide config contract (what every builder must return)

```js
{
  id: string,                      // required, unique
  type: "yourThing",               // required, used by overview glyph map
  title?: string,                  // shown in overview cards
  notes?: string,                  // shown in the speaker-notes pane on N
  snippets?: Snippet[],            // shown in the code modal on C
  steps?: number,                  // optional, internal step count
  render(root: HTMLElement): void, // builds the slide DOM into `root`
  onEnter?(ctx),                   // when the slide becomes active
  onStep?(stepIndex, ctx, opts),   // forward step (opts.replay = true on hash refresh)
  onUnstep?(stepIndex, ctx),       // backward step
  onLeave?(ctx),                   // when leaving the slide
}
```

## Files to update — the cross-file checklist

This is the most important part of the skill. **A new slide type that
isn't in all of these is half-done and confuses every future user.** Treat
this as a literal checklist and don't merge until every box is ticked.

- [ ] **`js/builders.js`** — the factory function + export on `window.Builders`
- [ ] **`css/<name>.css`** — a new file linked from `index.html`
- [ ] **`index.html`** — `<link rel="stylesheet" href="css/<name>.css" />`
- [ ] **`types.d.ts`** — the `<Name>SlideOpts` interface + reference from `BuildersAPI`
- [ ] **`js/overview.js`** — add an entry to `TYPE_GLYPH` if you want a distinct icon
- [ ] **`presentations/examples/deck.js`** — one slide demonstrating realistic usage
- [ ] **`README.md`** — add to the "Slide builders" table AND the "Builder reference" code-block section
- [ ] **`tests/`** — at least one Playwright test exercising the new type
- [ ] **`CHANGELOG.md`** — add a bullet under `[Unreleased]` → `### Added`

## Steps

1. **Confirm the name and props with the user.**
   - Use camelCase ending in `Slide` (e.g. `timelineSlide`, `gridSlide`).
   - List the props minimally — follow existing builders.
   - Confirm the slide is genuinely **reusable**, not deck-specific. If
     it's deck-specific, use `Builders.register()` in the deck file
     instead and stop here.

2. **Add the builder factory to `js/builders.js`.**
   - Place it next to the others.
   - Follow the existing pattern: closure over per-instance state, accept
     `notes` and `snippets`, return a config object with the lifecycle
     hooks you actually need.
   - Set `type: "<name>"` so the overview glyph map can find it.

3. **Export it on `window.Builders`** in the object literal at the bottom.

4. **Create `css/<name>.css`** with the styles for your slide.
   - **CRITICAL:** never put `display: <something>` directly on
     `.slide--<name>` without qualifying it with `.is-active`. This is
     the single most common bug in the engine — see the bigtext fix in
     git history.
   - Use CSS variables from `css/theme.css` for colors. Do not hardcode
     hex values; that breaks per-deck theming.

5. **Link the CSS from `index.html`** alongside the other slide CSS files.

6. **Add the type to `types.d.ts`**:
   - Add a `<Name>SlideOpts` interface
   - Add the method to `BuildersAPI`
   - Add `<name>` to the `SlideType` union

7. **Add the overview glyph in `js/overview.js`** if the slide deserves
   its own icon. Add a single character/emoji to the `TYPE_GLYPH` map.

8. **Add an example slide to `presentations/examples/deck.js`.**
   - Pick a sensible id like `<name>-example`.
   - Use realistic content, not lorem ipsum.
   - The examples deck doubles as the test fixture and the documentation
     showcase, so be deliberate.

9. **Add a Playwright test in `tests/`.**
   - Either extend an existing spec file or create a new one.
   - At minimum: navigate to the example slide and assert it renders.
   - If your type has steps, test forward + backward navigation.

10. **Update `README.md`:**
    - Add a row to the "Slide builders" table with a one-line description.
    - Add a code example to the "Builder reference (with examples)"
      section, matching the format of existing entries.

11. **Update `CHANGELOG.md`** under `[Unreleased]` → `### Added`:

    ```md
    - New `<name>Slide` builder for <use case>.
    ```

12. **Run the test suite.**

    ```bash
    npm test
    ```

    Confirm everything passes — both the new test and the existing ones.

13. **Smoke-test in the browser.**
    Open `index.html?deck=examples`, navigate to the example slide, walk
    every step. Press `Esc` to confirm the overview glyph is right.
    Press `N` to confirm notes work. Press `C` if you added snippets.

## Don't

- Don't ship a new slide type that's missing any item in the cross-file
  checklist above. It will confuse the next user.
- Don't add an external dependency. Vanilla JS only.
- Don't introduce ES modules or `import` syntax. The engine is plain
  IIFEs that attach globals.
- Don't reach into other engine modules' internals — use the documented
  globals (`Router`, `Diagram`, etc.).
- Don't put `display:` on `.slide--<name>` without `.is-active`.
- Don't put hardcoded colors in `css/<name>.css`. Use CSS variables.
- Don't skip the test. CI will catch you and a reviewer will reject the PR.
