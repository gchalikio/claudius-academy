---
name: add-slide-builder
description: Add a new reusable slide builder (e.g. timelineSlide, gridSlide) to the engine — wires the builder, CSS, types, README, tests, and an example.
---

# Skill: add a new slide builder

Use this when the user wants a new reusable slide kind that should ship with
the engine (not a one-off custom slide for a single deck — those go in the
deck file via `Builders.register()`).

## Read first

- `js/builders.js` — every existing builder follows the same pattern
- `js/router.js` — to understand the slide config shape and lifecycle hooks
- `types.d.ts` — the type definitions you'll extend
- `README.md` — the builder reference table you'll update
- `presentations/examples/deck.js` — where you'll add a usage example

## Slide config contract (every builder must return this)

```js
{
  id: string,                      // required, unique
  type: "yourThing",               // required, used by overview
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

## Steps

1. **Confirm the builder name and props with the user.**
   Use camelCase ending in `Slide` (e.g. `timelineSlide`, `gridSlide`).
   List the props it takes — keep them minimal, follow existing builders.

2. **Add the builder factory to `js/builders.js`.**
   Place it next to the others. Follow the existing pattern: closure over
   any per-instance state, accept `notes` and `snippets`, return a config
   object with the lifecycle hooks you need.

3. **Export it on `window.Builders`.**
   Add to the object literal at the bottom of `js/builders.js`.

4. **Add CSS in a new file.**
   Create `css/<name>.css` (or extend an existing one if it's a small
   variant). Link it from `index.html`. Important rule: never put `display:
   block` on a `.slide--*` class without qualifying it with `.is-active` —
   that breaks slide hiding (see git history for the bigtext bug).

5. **Add the option type to `types.d.ts`.**
   Add a `<Name>SlideOpts` interface and reference it from `BuildersAPI`.

6. **Add an example to `presentations/examples/deck.js`.**
   One slide demonstrating realistic usage. Give it a sensible id like
   `<name>-example`.

7. **Add a Playwright test to `tests/`.**
   Create or extend a spec file. At minimum, navigate to the example slide
   and assert the slide renders. If your builder has steps, test that
   stepping forward/backward updates the DOM as expected.

8. **Update `README.md`:**
   - Add the builder to the "Slide builders" table with a one-line use.
   - Add a code example to the "Builder reference" section.

9. **Run the test suite:**
   ```bash
   npm test
   ```
   Confirm everything passes.

10. **Update the overview glyph map in `js/overview.js`** if you want a
    distinct icon for your slide type — add an entry to `TYPE_GLYPH`.

## Don't

- Don't add an external dependency for the builder. Vanilla JS only.
- Don't introduce ES modules or `import` syntax — the engine is plain
  IIFEs that attach globals.
- Don't reach into other engine modules' internals. Use `Router`,
  `Diagram`, etc., as documented.
- Don't skip the test or the README update. The CI runs the tests and a
  reviewer will reject a PR with no docs/tests for a new builder.
