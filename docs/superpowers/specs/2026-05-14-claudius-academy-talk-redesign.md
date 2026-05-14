# Claudius Academy talk — redesign spec

**Date:** 2026-05-14 (talk: 2026-05-15)
**Author:** George Chalikiopoulos
**Status:** Approved, ready for implementation plan

## Why

The talk is tomorrow. The current deck targets ~45 min with 23 slides; the new
target is **40 min** and we need to add three things:

1. A concrete "what happens when I prompt" mental-model slide that compares a
   weak prompt to a strong one through the same token/context cycle.
2. A "teach your team" beat — Claude isn't only for devs; the inputs you get
   from PMs / designers / support are the leverage point.
3. A "this repo" outro — Claudius Academy itself is the meta proof.

We also want the engine to support these without one-off hacks, so two small
builder additions land first.

## The one takeaway (unchanged)

> **Make it yours.**

## Scope

In:
- Add `mediaSlide` builder (video / image / placeholder fallback).
- Add `qrSlide` builder (QR + URL + tagline).
- Rewrite mental-model section (1 → 3 slides: existing bigText, new
  concrete-prompts diagram, kept consequence).
- Trim Autonomy from 4 → 3 (drop the demo-intro slide).
- Trim Discipline from 3 → 2 (merge `cost` + `tools` into one slide).
- Trim Skills from 5 → 4 (drop one — TBD in plan: probably
  `skills-compose` or `skills-demo-intro`, decide during implementation).
- Add Non-devs section (2 slides: compareSlide + textSlide).
- Add Repo outro (1 slide via new `qrSlide`).

Out:
- New keybindings.
- New URL params.
- Section timer / iframe slide (nice-to-have, too risky for tomorrow).
- Recording new demos (Skills demo still uses placeholder; Autonomy demo
  intro is dropped).

## Structure (27 slides, ~40 min)

| # | Section | Slides | Time |
|---|---|---|---|
| 1 | Opener | 2 | 3 min |
| 2 | Mental model | 3 | 4 min |
| 3 | Context | 5 | 7 min |
| 4 | Skills | 4 | 6 min |
| 5 | Rules | 3 | 4 min |
| 6 | Autonomy | 3 | 5 min |
| 7 | Discipline | 2 | 3 min |
| 8 | Non-devs (new) | 2 | 3 min |
| 9 | Repo outro (new) | 1 | 2 min |
| 10 | Close | 2 | 3 min |
| **Total** | | **27** | **40 min** |

Q&A: 15 min after, gate-able at 40 min.

## Engine additions

### `mediaSlide(opts)`

Replaces the three current TODO "demo intro" `textSlide`s. Single builder,
handles three states gracefully:

- `videos: [...]` → press V works as today.
- `images: [...]` → press I works as today.
- Neither → render a labelled placeholder card on the slide body
  ("📼 Demo placeholder — press V when recorded") so the slide is never
  blank or broken on stage.

Why: today the demo-intro slides hard-code `TODO` text in the body. If the
recording doesn't land, the speaker is reading TODO live. Placeholder
fallback means the slide always looks intentional.

```js
mediaSlide({
  id: "context-demo",
  eyebrow: "Demo",
  title: "Watch context become work",
  body: "...one-line setup...",
  videos: [...], // optional
  images: [...], // optional
  notes: "...",
})
```

### `qrSlide(opts)`

A single slide showing a QR code + URL + tagline, sized for back-of-room
visibility. Generates the QR client-side from a URL string (small inline
SVG generator — no runtime deps per project rules) OR accepts a static
image path.

Why: the repo outro needs a QR the audience can scan. We don't want to
require a screenshot for this — it should be one config value.

```js
qrSlide({
  id: "repo-outro",
  url: "https://github.com/.../claudius-academy",
  tagline: "Fork it. Make it yours.",
  notes: "...",
})
```

**Decision (locked):** `qrSlide` accepts a static QR image path
(`qrSrc`), not runtime-generated. Reasons: hard rule #2 forbids runtime
deps, a from-scratch QR encoder is too risky the day before the talk,
and offline QR generation is 30 seconds of work. The builder is a
layout, not a generator.

## Slide-by-slide content

### Opener (2 slides, unchanged)

1. `compareSlide` — What this talk isn't / This instead
2. `bigTextSlide` — "Make it yours."

### Mental model (3 slides — was 2)

1. `bigTextSlide` — "An LLM only sees what's in its context window." *(kept)*
2. **NEW** `diagramSlide` — Two prompts through the cycle.
   - Step set A: weak prompt ("this color in this div is wrong and should
     be black") flows through `prompt → tokens → tiny context blob → model
     → confident guess`. The "context" node renders small/dim.
   - Step set B: rich prompt ("In `Button.tsx:42`, the `text-danger-700`
     token is rendering as red instead of `text-danger-900`; design spec
     in Figma link...") flows through the same nodes, but the context node
     swells visibly, and the output is now "right line, right token".
   - Same diagram, two passes — the audience watches the diagram tell the
     story.
3. `diagramSlide` — the request loop (existing `llm-loop`, kept as the
   "consequence" slide). Bridge: garbage in → garbage out. THAT is why the
   next 35 minutes matter.

### Pillar 1 — Context (5 slides, unchanged)

1. `textSlide` — Stop pasting
2. `diagramSlide` — connector flow
3. `splitSlide` — Links are inheritance
4. `mediaSlide` — Context demo (was textSlide, now uses placeholder fallback)
5. `bigTextSlide` — Context is a system, not a paste.

### Pillar 2 — Skills (4 slides — was 5)

1. `textSlide` — Stop waiting
2. `listSlide` + snippet — The repeatable stuff
3. `mediaSlide` — Develop a ticket. Hunt a bug. (was textSlide)
4. `bigTextSlide` — Teach it once. Run it forever.

**Cut:** `skills-compose` (splitSlide). The "skills compose" idea lands
verbally over the listSlide instead. If user prefers cutting the demo
intro instead, swap.

### Pillar 3 — Rules (3 slides, unchanged)

1. `textSlide` — Wrong with confidence
2. `listSlide` — Make it impossible
3. `bigTextSlide` — Mechanisms, not vigilance

### Autonomy (3 slides — was 4)

1. `textSlide` — Claude isn't in your editor
2. `diagramSlide` — the autonomy flow
3. `textSlide` — Humans at the merge gate

**Cut:** `autonomy-demo-intro`. The diagram + the merge-gate slide carry
the section. Removing the recorded-demo dependency removes the biggest
risk item before tomorrow.

### Discipline (2 slides — was 3)

1. `compareSlide` — Discipline looks like this (existing). Now also carries
   the "tokens cost" framing in the eyebrow / opening line.
2. `textSlide` — A few worth knowing (rtk, Explore, Plan). Add one
   sentence at the top: "Today they're cheap. Tomorrow they may not be."

**Cut:** standalone `discipline-cost` slide — its idea folds in.

### Non-devs (2 slides — NEW)

1. `compareSlide` — eyebrow "Beyond your editor"; title "Your team is your
   context pipeline."
   - Left ("What lands in your queue today"): generic tickets, Figma files
     no one labelled, Slack threads with no log links, "it doesn't work"
     bug reports.
   - Right ("What lands in your queue when your team gets it"): tickets
     with Honeycomb traces, Figma frames named for the component, Slack
     threads with PR links, bug reports with reproductions.
2. `textSlide` — "Teach your team to write for Claude." Body: your
   leverage isn't your prompts — it's what arrives in your queue. PMs,
   designers, support, ops. Each one is a Claude user, whether they know
   it or not.

### Repo outro (1 slide — NEW)

`qrSlide` — Claudius Academy repo. URL + QR + "this deck, the engine, the
skills — on GitHub. Mostly built by Claude. Fork it."

### Close (2 slides, unchanged)

1. `listSlide` — Five principles
2. `bigTextSlide` — "Make it yours."

## Placeholders to fill in before talk

| Placeholder | Slide | Format | Fallback if not filled |
|---|---|---|---|
| Context demo media | `context-demo` | video (.mp4) or 2-3 images | `mediaSlide` placeholder card |
| Skills demo media | `skills-demo` | video (.mp4) or 2-3 images | `mediaSlide` placeholder card |
| Two-prompt examples copy | `llm-prompts` | text in slide steps | Use the examples in this spec verbatim |
| Repo URL + QR target | `repo-outro` | URL string | Use `https://github.com/[your-handle]/claudius-academy` |
| Welcome lines | spoken over opener | rehearsed paragraph | n/a — spoken |

## Non-goals

- No recording new content — fallbacks must work without it.
- No engine refactor beyond the two new builders.
- No new keybindings, URL params, or themes.
- No promise that the deck will be perfect — it must be *runnable* and
  *defensible* with zero new media captured.

## Test plan

For engine changes:
- Add a Playwright spec for `mediaSlide` covering: video present, image
  present, neither present (placeholder visible).
- Add a Playwright spec for `qrSlide` covering: URL renders, QR element
  is present, tagline renders.

For deck changes:
- Smoke test: load the deck, step through every slide, no console errors.
- Manual: rehearse front-to-back at least once, target 40 min.

## Open questions to resolve in the plan

1. Which Skills slide to cut: `skills-compose` (splitSlide) vs
   `skills-demo-intro` (textSlide → mediaSlide). Default: cut compose.
2. QR generator: vanilla JS inline vs static image path. Default: try
   inline first with a 1-hour budget, then fall back.
3. The two-prompt diagram: implement as one `diagramSlide` with many
   steps, or two `diagramSlide`s back-to-back. Default: one slide, two
   step phases — the "morph" is the payoff.
