---
name: add-slide
description: Add or edit a single slide inside an existing deck — picks the right builder, places the slide in the correct act, adds notes/snippets, and verifies it renders.
---

# Skill: add a slide

Use this when the user wants to add (or edit) **one slide** in an existing
deck. For starting a brand new deck, use `add-presentation` instead.

## Read first

- `presentations/<deck>/deck.js` — the file you'll be editing
- `README.md` — the "Slide builders" reference table and examples
- `presentations/examples/deck.js` — a live working sample of every builder
- `types.d.ts` — the option shape for the builder you'll use

## Pick the right builder

Match the user's intent to a builder before writing anything:

| User says…                                 | Builder        |
| ------------------------------------------ | -------------- |
| "Add a slide that says X with a paragraph" | `textSlide`    |
| "Add a quote"                              | `quoteSlide`   |
| "Add an act/section divider"               | `sectionSlide` |
| "I want bullets that reveal one at a time" | `listSlide`    |
| "Two columns side by side"                 | `splitSlide`   |
| "Wrong vs right"                           | `compareSlide` |
| "One sentence in big text"                 | `bigTextSlide` |
| "Show an image with a NO overlay"          | `imageSlide`   |
| "Draw a diagram step by step"              | `diagramSlide` |

If the user wants something none of those cover, go to the
`add-slide-builder` skill instead.

## Steps

1. **Ask where the slide goes.**
   - Which act/section? Which slide should it come _after_?
   - If unclear, list the current slide ids in order so the user can point.

2. **Confirm the slide id.**
   - kebab-case, unique within the deck (e.g. `docs-evolution`,
     `pillar-3-callback`).
   - Reject ids that already exist.

3. **Draft the slide config.**
   - Use the builder reference in `README.md` for the option names.
   - Always include:
     - `id`
     - `notes` if the slide has anything that's easier to _say_ than show
     - `snippets` if it makes sense to back the slide with code
   - For `listSlide`, items reveal one per →, so don't put more than 5–6.
   - For `bigTextSlide`, keep `text` to one sentence (≤8 words ideally).

4. **Insert the slide into `presentations/<deck>/deck.js`.**
   - Place it inside the slides array at the right position.
   - Match the indentation and style of the surrounding slides.
   - Group related slides; keep act dividers visible.

5. **Verify in the browser.**
   - Reload `index.html?deck=<deck-id>`.
   - Step to the new slide. Confirm:
     - The layout looks right.
     - Internal steps work (if any).
     - Pressing `N` shows the notes you added.
     - Pressing `C` shows the snippets you added.
     - The overview (`Esc`) shows the new card with the right title.

6. **If the deck is the _public_ one, run the test suite.**

   ```bash
   npm test
   ```

   Personal decks (gitignored) don't need this — tests target `examples`.

## Don't

- Don't reuse a slide id from another deck — id collisions are confusing
  in the URL hash.
- Don't add a slide that's just a placeholder unless the user explicitly
  asks for one. Empty slides waste audience attention.
- Don't put the new slide _outside_ its act (e.g. a Pillar III bullet
  inside Act II). Acts give the talk rhythm.
- Don't introduce a new slide _type_ in this skill. Use `add-slide-builder`.
