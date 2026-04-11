---
name: write-diagram
description: Author a progressive SVG diagram (the centrepiece of any visual talk) — designs the layout, computes coordinates, sequences the draw steps, and tunes curves so arrows don't collide.
---

# Skill: write a diagram

Use this when the user wants to add a `diagramSlide` — the most complex
slide kind. Diagrams reward thinking before typing; this skill enforces
that.

## Read first

- `js/diagram.js` — to understand how shapes/arrows are drawn
- `presentations/examples/deck.js` — the simple `diagram-example`
- `presentations/claudius-academy/deck.js` (if it exists) — the
  fullscreen `context-diagram` is a richer reference
- `types.d.ts` — the `DiagramStep` type for exact field names

## Mental model

A diagram is a list of **steps** that play in order. Each step is either:

- a **node** (`circle`, `ellipse`, or `rect`) that sits at `(x, y)`
- an **arrow** that connects two nodes by id, optionally with a `curve`

`viewBox` is the coordinate space — defaults to `1600 × 900` (wide
landscape). Coordinates inside `steps` are in viewBox units, not pixels.

`fullscreen: true` makes the slide fill the viewport with no chrome —
use it when the diagram IS the slide and there's no need for a title.

## Steps

1. **Confirm what the diagram is showing.**
   Make the user say it in one sentence. *"The flow of context from
   sources into Claude and back out again via skills."* If the answer is
   vague, push back — a vague diagram drawn live is worse than no diagram.

2. **Sketch the layout on paper or in text first.**
   - How many nodes?
   - Where does each one live (left/centre/right, top/middle/bottom)?
   - Which arrows connect which nodes? Which direction?
   - Is there a "callback" arrow that loops back later? Note it.

3. **Pick a viewBox.**
   - For windowed (with title): `1000 × 560` works.
   - For fullscreen: `1600 × 900` (matches typical screen aspect).

4. **Place the central node first.**
   - Put it near the centre of the viewBox.
   - If it's the focus, give it `accent: true` (gold fill).
   - For a centerpiece, use `ellipse` with generous `rx`/`ry` (e.g.
     `rx: 200, ry: 120`).

5. **Place satellite nodes.**
   - Group them by relationship (sources on the left, outputs on the right).
   - Leave generous space — coordinates that look fine in your head often
     overlap once labels render.
   - For ellipses, `rx ≈ label_length × 18` is a reasonable default.

6. **Sequence the steps.**
   - Each step is one beat of your narration. The more steps, the slower
     the diagram unfolds.
   - Order matters: introduce a node *before* any arrow that references it.
   - Aim for 5–10 steps. More than 12 and the audience loses track.

7. **Add arrows last.**
   - Each arrow takes `from`, `to`, and an optional `curve` (positive or
     negative bend, ~0.05 to 0.55).
   - **Curves matter when arrows might collide.** If two arrows go between
     similar areas, give them opposite-signed curves so they bow apart.
   - Use `accent: true` on arrows that mean something special (e.g. a
     "writes back" loop).
   - Add `label: "..."` only when the relationship isn't obvious. Empty
     arrows feel cleaner than a forest of labels.

8. **Walk the steps in the browser.**
   - Reload, navigate to the slide.
   - Press `→` for each step. After each press, check:
     - Does the new element appear in the right place?
     - Does it overlap an existing element?
     - Does the audience's eye know where to go?
   - If something overlaps, tune `x`/`y`/`rx`/`ry` and reload.

9. **Tune curves last.**
   - Increase magnitude (`0.18` → `0.35`) to bow the arrow further out.
   - Flip the sign to bow the other way.
   - For "writes back" loops, often `±0.5` is right.

10. **Add to the deck.**
    Place the `diagramSlide({...})` call inside the deck array. If it's
    the centerpiece of an act, give it its own slide id like
    `<act>-diagram` and consider `fullscreen: true`.

11. **If the diagram is in the *public* deck, add a test** that asserts:
    - The slide renders.
    - At least one node appears after one `→`.
    See `tests/diagram.spec.js` for the pattern.

## Don't

- Don't author a diagram with more than ~12 steps. The audience can't
  track that many transitions in real time.
- Don't put labels on every arrow. Labels are visual noise.
- Don't use `circle` when you have a long label — labels overflow narrow
  circles. Use `ellipse` with `rx` matched to the label length.
- Don't forget to test the full sequence forward AND backward — `←` is a
  real navigation key during talks.
- Don't hardcode pixel coordinates. Always work in the viewBox space.
