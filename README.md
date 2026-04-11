# Claudius Academy

> A vanilla-JS presentation engine for browser-native talks. Open
> `index.html` and present. No build step. No framework. No `node_modules`
> at runtime.

[![Tests](https://github.com/gchalikio/claudius-academy/actions/workflows/test.yml/badge.svg)](https://github.com/gchalikio/claudius-academy/actions/workflows/test.yml)
[![Pages](https://github.com/gchalikio/claudius-academy/actions/workflows/deploy-pages.yml/badge.svg)](https://gchalikio.github.io/claudius-academy/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)

**Live demo →** <https://gchalikio.github.io/claudius-academy/>

---

## What you get

- **Slide builders** — text, lists, splits, compare, quote, big-text,
  image, section divider, and progressive SVG diagrams.
- **Speaker tools** — notes pane, overview grid, talk timer with target
  warning, hint overlay.
- **One unified media modal** — videos, code snippets, and image
  galleries, opened by `V` / `C` / `I`.
- **Per-deck theming** — every color, font, and layout token is a CSS
  variable you can override from `config.js`. Engine code stays untouched.
- **AI-first authoring** — `.claude/skills/` ships flows for every common
  task; point Claude Code or Cursor at `CLAUDE.md` and ask in plain English.

---

## Quick start

**Claude-first (recommended).** Just cloned the repo? Ask Claude Code:

```text
/setup-locally
```

It installs dependencies, runs the Playwright install, boots the server,
and leaves you on the picker.

**Manual:**

```bash
npm start          # node static server on :8000
# or just:
open index.html    # works for everything except dynamic deck loading
```

Visit `http://localhost:8000` and pick a deck, or jump straight in with
`?deck=examples`.

---

## Make a new deck (60 seconds)

**Claude-first (recommended).** This repo is Claude-first — every common
flow ships as a skill. Just ask Claude Code:

```text
/add-presentation
```

It'll prompt you for the deck id/title, scaffold `presentations/<id>/`,
register it, and leave you with a runnable starting point.

**Manual fallback:**

```bash
cp -r presentations/examples presentations/my-talk
```

1. Edit `presentations/my-talk/config.js` (title, intro text, theme).
2. Edit `presentations/my-talk/deck.js` (your slides).
3. Register it in `presentations/index.js`:

   ```js
   window.DECKS = [
     { id: "examples", title: "Examples — every builder" },
     { id: "my-talk", title: "My Talk" },
   ];
   ```

4. Visit `?deck=my-talk`.

**Personal/work deck that should never be committed?** Drop it under
`presentations/local/` (gitignored) and add `local: true` to its registry
entry in `presentations/local/decks.js`. The loader handles the rest.

---

## Slide builders

**Claude-first (recommended).** To add or edit a slide, ask Claude Code:

```text
/add-slide        # any slide type
/write-diagram    # progressive SVG diagramSlide
```

The skills pick the right builder, place the slide in the correct act,
wire up notes/snippets, and verify it renders.

All builders live on `window.Builders`. Open the **Examples** deck to see
each one live; the snippets below show the minimum to get a slide on screen.

| Builder        | Use it for                                       |
| -------------- | ------------------------------------------------ |
| `textSlide`    | Eyebrow + title + HTML body                      |
| `sectionSlide` | Act/pillar divider with a big chapter numeral    |
| `listSlide`    | List that reveals one item per →                 |
| `splitSlide`   | Two columns (text+visual or text+text)           |
| `compareSlide` | Wrong vs right with red/green columns            |
| `quoteSlide`   | Big centered quotation                           |
| `bigTextSlide` | One huge sentence; optional reveal on first →    |
| `imageSlide`   | Image with a giant red X overlay on first →      |
| `diagramSlide` | Progressive SVG diagram, one node/arrow per step |

Every builder also accepts `notes`, `snippets`, `videos`, and `images` —
all read by the speaker-notes pane and the unified media modal.

### Examples

```js
textSlide({
  id: "intro",
  eyebrow: "Welcome",
  title: "Hello world",
  body: `<p>Plain HTML body.</p>`,
  notes: "Speaker notes (press N).",
});

sectionSlide({
  id: "act-2",
  numeral: "II",
  eyebrow: "Pillar Two",
  title: "Context",
  subtitle: "The single highest-leverage skill you can build.",
});

listSlide({
  id: "three-things",
  title: "What you'll learn",
  items: ["Idea one", "Idea two", "Idea three"],
});

splitSlide({
  id: "split",
  title: "Two columns",
  left: `<p>Left.</p>`,
  right: `<img src="presentations/my-talk/assets/images/x.svg" />`,
  ratio: "1fr 1.4fr", // optional
});

compareSlide({
  id: "compare",
  title: "Wrong vs right",
  left: { title: "Wrong", items: ["a", "b"] },
  right: { title: "Right", items: ["x", "y"] },
});

quoteSlide({ id: "quote", quote: "Worth sitting with.", cite: "anonymous" });

bigTextSlide({
  id: "takeaway",
  text: "Grow with Claude.",
  footnote: "the one thing to remember",
  reveal: true,
});

imageSlide({
  id: "anti-pattern",
  title: "Don't do this",
  src: "presentations/my-talk/assets/images/example.png",
  alt: "Example to avoid",
});

diagramSlide({
  id: "context",
  fullscreen: true,
  viewBox: { width: 1600, height: 900 },
  steps: [
    {
      type: "node",
      id: "ctx",
      shape: "ellipse",
      x: 800,
      y: 460,
      rx: 200,
      ry: 120,
      label: "CONTEXT",
      accent: true,
    },
    {
      type: "node",
      id: "jira",
      shape: "ellipse",
      x: 200,
      y: 180,
      rx: 130,
      ry: 60,
      label: "JIRA",
    },
    { type: "arrow", from: "jira", to: "ctx", label: "tickets" },
  ],
});
```

Diagram shapes: `circle` (`r`), `ellipse` (`rx`/`ry`), `rect` (`w`/`h`).
Arrows take an optional `curve` (positive/negative bends opposite ways)
and `accent`.

### Custom builders

Need a slide type that doesn't exist? Register one from your deck:

```js
window.Builders.register("myThing", function (opts) {
  return Builders._baseSlide(opts, "myThing", {
    title: opts.label,
    render(root) {
      root.innerHTML = `<h1>${opts.label}</h1>`;
    },
  });
});
```

`_baseSlide` forwards `notes`/`snippets`/`videos`/`images` for you.

---

## Key bindings

| Key             | Action                                  |
| --------------- | --------------------------------------- |
| `→` / `Space`   | next step (or next slide)               |
| `←`             | previous step (or previous slide)       |
| `⇧` + `→` / `←` | skip to next / previous slide           |
| `V` / `C` / `I` | media modal — videos / code / images    |
| `N`             | speaker notes                           |
| `T`             | talk timer                              |
| `Esc`           | overview grid (or close any open modal) |
| `F`             | browser fullscreen                      |
| `Home` / `⇧+0`  | back to deck picker                     |
| `?`             | hint panel                              |
| `1`–`9`         | (in the media modal) jump to that tab   |

While the media modal is open, `←/→` switches tabs and `V/C/I` switches
between videos / snippets / images.

URL flags: `?deck=<id>` loads a specific deck, `?nointro` skips the intro.

---

## Configuration

Everything per-deck lives in `presentations/<deck>/config.js`:

| Key             | What it sets                                                  |
| --------------- | ------------------------------------------------------------- |
| `documentTitle` | Browser tab title                                             |
| `intro`         | Intro animation: title, subtitle, logo, laurels, autoadvance  |
| `media`         | Global `videos`/`snippets`/`images` shown on every slide      |
| `nav`           | Counter format function                                       |
| `timer`         | `show: true` and `target: 45` (minutes) — turns gold past 80% |
| `hints`         | Custom list of `{ keys, label }` shown in the `?` overlay     |
| `theme`         | CSS variable overrides — see `css/theme.css` for the catalog  |
| `fonts`         | Array of `@font-face` declarations injected at boot           |
| `stylesheet`    | Optional per-deck CSS file (default `theme.css`)              |

---

## Theming

**Claude-first (recommended).** Ask Claude Code:

```text
/theme-deck
```

It customises colors, fonts, and intro decorations for a single deck
without touching engine CSS.

90% of theming is just overriding CSS variables in `config.js`:

```js
theme: {
  "gold-500": "#d8b252",
  "parchment-100": "#f7eed8",
  "font-display": "'Trajan Pro', serif",
}
```

For custom fonts, drop `.woff2` files into `assets/fonts/` and list them
in `config.fonts`. For anything CSS variables can't express, edit
`presentations/<deck>/theme.css` — it loads after the engine CSS so it
wins.

The engine ships a parchment + pixel default look, but every token is
overridable. **Never edit files under `css/` for a single deck.**

---

## Project layout

```text
.
├── index.html                ← entry point
├── css/                      ← engine styles (theme tokens, slide layouts, modals)
├── js/                       ← engine code, one IIFE per file → one window global
│   ├── router.js             ← slide + step navigation, hash routing
│   ├── builders.js           ← slide constructors
│   ├── diagram.js            ← progressive SVG diagram engine
│   ├── media.js              ← unified videos/code/images modal
│   ├── notes.js  overview.js timer.js  intro.js
│   ├── nav.js                ← keyboard + buttons
│   ├── loader.js             ← picks and dynamically loads a deck
│   └── main.js               ← Boot.start()
├── presentations/
│   ├── index.js              ← public deck registry
│   ├── examples/             ← public showcase (every builder)
│   └── local/                ← gitignored — personal decks live here
├── tests/                    ← Playwright tests
├── .claude/skills/           ← reusable skills for AI assistants
├── types.d.ts                ← editor type hints (no build needed)
└── CLAUDE.md  CONTRIBUTING.md  CHANGELOG.md  LICENSE
```

---

## Tests

**Claude-first (recommended).** When something breaks or lint is red:

```text
/fix-a-bug       # reproduce, fix, and add a regression test
/lint-and-fix    # run linters and auto-fix what's fixable
```

**Manual:**

```bash
npm install              # one-time
npm run test:install     # one-time, downloads chromium
npm test                 # headless
npm run test:headed      # watch the browser
npm run test:ui          # Playwright UI mode
```

CI runs the same suite on every push and pull request.

---

## AI-first authoring

The repo ships with [Claude Code skills](.claude/skills/) for every common
task. Open it in any AI-aware editor and ask in plain English:

> _"Add a diagram showing JIRA → context → API."_
> _"Make a new deck called Q4 review and add 8 placeholder slides."_
> _"My takeaway slide isn't centering — fix it."_

Skills available: `setup-locally`, `add-presentation`, `add-slide`,
`write-diagram`, `theme-deck`, `add-video`, `outline-to-deck`,
`rehearse-talk`, `take-screenshots`, `add-slide-type`, `add-feature`,
`triage-issue`, `work-github-issue`, `fix-a-bug`, `lint-and-fix`,
`cut-release`. See `.claude/skills/` for the full list.

`CLAUDE.md` is loaded automatically — it documents the hard rules
(vanilla JS only, engine vs content separation) so the AI never has to
guess the conventions.

---

## More

- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) — open an issue
  first for non-trivial work, keep PRs scoped, add a Playwright test for
  any new keybinding or builder.
- **Code of conduct:** [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)
  — see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- **Security:** static client-side engine, no backend. Reports go to
  [SECURITY.md](SECURITY.md), please don't file public issues.
- **Changelog:** [CHANGELOG.md](CHANGELOG.md) — follows
  [SemVer](https://semver.org/) and
  [Keep a Changelog](https://keepachangelog.com/).
- **Editor support:** `types.d.ts` gives VS Code, Cursor, and JetBrains
  full autocomplete on slide configs with no build step.

---

## License

MIT — see [LICENSE](LICENSE).

The name is a pun on _Claude_; the historical emperor was famously bookish
and scholarly, which felt fitting for an academy of presentations. The
engine itself is theme-agnostic — the parchment look is just the default.
