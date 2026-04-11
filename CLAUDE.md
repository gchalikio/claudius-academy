# CLAUDE.md — project context for Claude (and other AI assistants)

This file is read by Claude Code, Cursor, and similar tools to understand
the project before suggesting changes. If you're working on this repo with
an AI assistant, point it at this file first.

## What this project is

**Claudius Academy** is a vanilla-JS, no-build presentation engine for
browser-native talks. Open `index.html` and present. Each presentation is a
folder under `presentations/` with a `config.js` (branding/theme) and a
`deck.js` (slide content). The engine in `js/` and `css/` is generic.

## Hard rules (do not violate)

1. **No build step.** The project must keep working when someone double-clicks
   `index.html`. Anything that requires `npm install` to *run the deck* is a
   hard no. Tooling for *development* (Playwright tests, type checking via
   JSDoc + tsconfig) is allowed because it doesn't affect end users.
2. **No runtime dependencies.** Vanilla JS, vanilla CSS, vanilla HTML only.
   `node_modules` exists for tests, never for the site itself.
3. **Engine and content are separate.**
   - Generic logic → `js/` and `css/`
   - Talk-specific data → `presentations/<deck-id>/`
   - Never put presentation content in `js/`. Never put engine code in
     `presentations/`.
4. **Configuration before code.** If a change can be made by editing
   `config.js` or `theme.css`, that is where it belongs. Only fall through
   to engine code when configuration genuinely cannot express it.
5. **No new global namespaces.** Each engine file is one IIFE that exposes
   exactly one global (`Router`, `Diagram`, `Modal`, `Code`, `Notes`,
   `Overview`, `Timer`, `Builders`, `Boot`).
6. **Always update tests + types + README** when you add or rename anything
   in the public surface (slide builders, config keys, key bindings).

## Project layout

```
.
├── index.html                  ← entry point
├── css/                        ← engine styles, one file per concern
├── js/                         ← engine code, one IIFE per file
│   ├── router.js               ← slide + step navigation
│   ├── diagram.js              ← progressive SVG diagram engine
│   ├── builders.js             ← reusable slide constructors
│   ├── modal.js  code.js       ← video and code-snippet modals
│   ├── notes.js  overview.js   ← speaker notes pane and overview grid
│   ├── timer.js  intro.js      ← talk timer and opening sequence
│   ├── nav.js                  ← keyboard + button bindings
│   ├── loader.js               ← picks and dynamically loads a deck
│   └── main.js                 ← Boot.start()
├── assets/                     ← shared assets (default logo, placeholder)
├── presentations/
│   ├── index.js                ← registry of available decks (DECKS, PICKER)
│   ├── examples/               ← sampler showing every builder
│   └── claudius-academy/       ← the example talk
│       ├── config.js           ← branding, theme, fonts, hints, timer
│       ├── deck.js             ← slide content (the spine of the talk)
│       ├── theme.css           ← optional per-deck CSS overrides
│       └── assets/             ← per-deck images, fonts, videos
├── tests/                      ← Playwright smoke + integration tests
├── types.d.ts                  ← editor type hints (no build step)
├── .claude/skills/             ← reusable skills for Claude Code (see below)
└── README.md  CONTRIBUTING.md  LICENSE
```

## Conventions

- **Indentation:** 2 spaces (enforced by `.editorconfig`).
- **Module pattern:** every engine file is a single IIFE that attaches one
  global to `window`. Don't introduce ES modules; the no-build constraint
  forbids them.
- **Comments:** explain *why*, not *what*. No comments that restate code.
  No JSDoc that just types out what an identifier already says.
- **CSS variables over hardcoded values.** New tokens go in `css/theme.css`
  so they can be overridden per-deck via `theme: { ... }` in config.
- **Slide builders** live in `js/builders.js`. Each one returns a slide
  config that the Router understands (see `types.d.ts` for the shape).
  Builders accept `notes` (speaker notes) and `snippets` (code modal) on
  every type.
- **Custom slide types** by a deck are added via
  `Builders.register("name", factory)` from inside the deck file — never by
  editing engine code from a deck.

## How to add things

The `.claude/skills/` directory contains step-by-step skills for the most
common contributions. **If you're an AI assistant, prefer these skills over
freeform editing** — they encode the rules above as concrete steps.

- `add-presentation.skill.md` — how to author a brand new deck
- `add-slide-builder.skill.md` — how to add a new reusable slide kind
- `fix-a-bug.skill.md` — how to triage, reproduce, fix, and test a bug

## Public API surface (what's stable)

If you're adding/renaming any of these, update **all four** of:
`types.d.ts`, the README's builder reference, the corresponding test in
`tests/`, and the `examples/` deck.

- **`window.Builders`** — the slide builder factories
- **`window.Router`** — `next`, `prev`, `nextSlide`, `prevSlide`, `goTo`,
  `current`, `onChange`, `index`, `slides`, `step`
- **`window.DECK_CONFIG`** schema — see `types.d.ts` for the shape
- **Slide config schema** — `{ id, type, title?, notes?, snippets?, steps?,
  render(root), onEnter?, onStep?, onUnstep?, onLeave? }`
- **Key bindings** — listed in the README
- **URL params** — `?deck=<id>`, `?nointro`, hash route `#/<slide-id>[/<step>]`

## Anti-patterns (do not do this)

- Adding a bundler, Webpack/Vite/Parcel, ES modules, JSX, etc.
- Inlining presentation content into `js/`.
- Hardcoding colors instead of CSS variables.
- Adding `display: <something>` directly on a `.slide--*` class without
  qualifying it with `.is-active` (this caused a real bug — see git history).
- Calling `getTotalLength()` on a detached SVG path (Safari returns 0).
- Adding new keybindings without updating both `index.html` hints AND the
  `hints` array in every deck's `config.js`.
- Skipping the test update when adding a feature.

## Testing

```bash
npm install              # one-time
npm run test:install     # one-time, downloads chromium
npm test                 # run all Playwright tests
```

CI runs the same suite on every push and PR via
`.github/workflows/test.yml`.
