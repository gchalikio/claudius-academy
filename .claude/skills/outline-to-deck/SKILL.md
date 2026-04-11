---
name: outline-to-deck
description: Turn a written talk outline into a draft deck — maps sections to acts, picks builders per slide, generates the slides array, and leaves the user with a runnable starting point.
---

# Skill: outline → deck

Use this when the user has a _written_ outline (in their head, in a doc,
in markdown) and wants Claude to bootstrap a runnable deck from it. The
goal is a draft they can refine, not a finished talk.

## Read first

- The outline (ask the user to paste it or point at the file)
- `presentations/examples/deck.js` — every builder, used as a reference
- `README.md` — Slide builders table
- `add-presentation/SKILL.md` — for the prerequisite folder/registry setup

## Steps

1. **Get the outline.**
   Ask the user to paste it, or read the file path they give. Don't
   guess what their talk is about — that almost always invents content
   they don't agree with.

2. **Run `add-presentation` first if the deck doesn't exist yet.**
   Don't try to write slides into thin air.

3. **Read the outline structure.**
   Look for:
   - **Top-level sections** → these become acts (`sectionSlide`)
   - **Sub-headings under each section** → individual content slides
   - **Numbered/bulleted lists** → `listSlide`
   - **Quotes** → `quoteSlide`
   - **Diagrams or "show this"** → `diagramSlide` or `imageSlide`
   - **One-line takeaways** → `bigTextSlide`
   - **"Wrong vs right" comparisons** → `compareSlide`
   - **"Show the code"** → a `textSlide` with `snippets`

4. **Map each outline element to a slide config** in your head before
   writing anything. Sketch the result in a small table:

   ```text
   "I. Why this matters"   → sectionSlide  (numeral I)
   "  - Who I am"           → textSlide
   "  - What this isn't"    → textSlide (or merged)
   "  - The thesis"         → bigTextSlide
   ```

   If the table is more than ~25 slides, push back — that's too long for
   most talks. Suggest cuts.

5. **Generate the slides array.**
   - Pick stable kebab-case ids (`act-1`, `welcome`, `pillar-2-diagram`).
   - Add **one micro-takeaway per act** as a `bigTextSlide` with
     `footnote` describing it.
   - Add `notes:` to slides where the outline implies content the title
     doesn't capture.
   - For diagrams, add a 2-3 step placeholder so the slide isn't empty;
     the user will refine via the `write-diagram` skill.

6. **Insert into `presentations/<deck>/deck.js`.**
   Replace the existing `slides` array with the new one.

7. **Smoke-test the deck.**
   Reload, walk every slide, press `Esc` to verify the overview makes
   sense. Note any slide where the title doesn't match the outline
   intent — those need a second pass.

8. **Hand back to the user with a punch list.**
   Tell them which slides are placeholders, which need a real diagram,
   and which need real notes. Don't pretend the draft is finished.

## Don't

- Don't invent content the outline doesn't have. If the outline is
  vague, ask follow-up questions; don't fill in.
- Don't generate more than ~25 slides. A 60-min talk fits in ~20.
- Don't put a `bigTextSlide` reveal on the planted-takeaway slide unless
  the user asks for it — the empty-state confused us before.
- Don't add a `compareSlide` "for variety" if the outline doesn't have a
  comparison. Pick the right builder, not the showiest one.
- Don't commit the draft deck immediately if the deck is gitignored. The
  user wants iteration freedom.
