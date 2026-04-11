---
name: theme-deck
description: Customise the look of a single deck — colors, fonts, intro decorations, theme.css overrides — without touching the engine CSS.
---

# Skill: theme a deck

Use this when the user wants to change how a deck looks: colors, fonts,
intro logo, light vs dark, etc. The engine is **theme-agnostic** — it
ships with a parchment + pixel default but every token is overridable
per deck. The goal of this skill is to do everything via the deck's
`config.js` and `theme.css`, never by editing files in `css/`.

## Read first

- `presentations/<deck>/config.js` — where most theming lives
- `presentations/<deck>/theme.css` — for changes that don't fit a CSS variable
- `css/theme.css` — to see every CSS variable available to override
- `README.md` — Theming section

## Three layers, in order of preference

1. **CSS variable overrides** (`config.theme`) — use this for ~90% of changes.
2. **`@font-face` injection** (`config.fonts`) — use this for custom fonts.
3. **Per-deck stylesheet** (`presentations/<deck>/theme.css`) — only when
   the change can't be expressed as a variable.

Never edit anything under `css/` for a single deck. That's engine code.

## Steps

1. **Confirm what the user wants to change.**
   Ask for a sentence: *"Make it dark with cyan accents and a brutalist
   sans-serif."* If they're vague, push back — vague theming makes everything
   look the same.

2. **Map the change to CSS variables.**
   Read `css/theme.css` once and find which variables map to what.
   Token names are historical (named after the default theme) but their
   *values* are arbitrary — you can set `--parchment-100` to dark blue
   and the engine doesn't care.
   - **Colors:** `--parchment-100/200/300` (background tints),
     `--ink-500/700/900` (text/foreground), `--gold-500/700` (accent),
     `--crimson-600` (alt accent), `--crt-green`
   - **Fonts:** `--font-display`, `--font-serif`, `--font-pixel`, `--font-ui`
   - **Layout:** `--maxw`, `--gutter`, `--radius-sm/md`
   - **Motion:** `--ease-out`, `--t-fast/med/slow`

3. **Edit `presentations/<deck>/config.js`** under the `theme:` block.
   Keys can be written with or without the leading `--`:
   ```js
   theme: {
     "parchment-100": "#0f1117",
     "ink-900": "#e6e6e6",
     "gold-500": "#5fc8ff",
     "font-display": "'Inter', sans-serif",
   },
   ```

4. **For custom fonts**, drop the `.woff2` files into
   `presentations/<deck>/assets/fonts/` and declare them in
   `config.fonts`:
   ```js
   fonts: [
     {
       family: "Inter",
       src: "url('presentations/<deck>/assets/fonts/Inter.woff2') format('woff2')",
       weight: 400,
       style: "normal",
       display: "swap",
     },
   ],
   ```
   Then reference the family from `theme["font-display"]` (or
   `font-serif`/`font-pixel`).

5. **For changes that can't be a variable**, edit
   `presentations/<deck>/theme.css`. This file is loaded after the engine
   CSS, so anything in it wins. Examples:
   - A custom slide layout unique to this deck
   - A different background texture
   - Changing the list slide's `ordered: true` counter from upper-roman
     to decimal:
     ```css
     .slide--list ol.list .list__item::before {
       content: counter(li) ".";
     }
     ```
   - Hiding the default scanline / vignette overlays:
     ```css
     .scanlines, .vignette { display: none; }
     ```

6. **Tune the intro decorations** in `config.intro`:
   - `laurel.show: false` to hide the ❦ flourishes
   - `laurel.left/right` to swap them for different glyphs
   - `logo` to point at a per-deck logo
   - `title` and `subtitle` to match the new vibe

7. **Reload and inspect every slide type used in the deck.**
   Theming bugs hide on slide types you didn't think about. Walk them all,
   plus open the modals (`V`, `C`), the notes pane (`N`), and the overview
   (`Esc`) — they all use the same tokens and might surprise you.

8. **Take a screenshot** for the README's screenshots section if this is
   a public deck and the new theme is significantly different.

## Don't

- Don't edit files under `css/` for theming. That's engine code; changes
  there affect every deck.
- Don't hardcode hex colors in `deck.js`. Use CSS variables so the theme
  stays in one place.
- Don't add a font without first checking that it has glyph coverage for
  the languages your slides use.
- Don't override a CSS token with `!important` in `theme.css` unless
  there's a real cascade conflict. The engine CSS doesn't use
  `!important`, so a normal override should win.
- Don't forget to test the modals and overview — they're the easiest
  things to break with a heavy theme change.
