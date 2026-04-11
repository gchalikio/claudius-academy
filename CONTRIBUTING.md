# Contributing

Thanks for considering a contribution. Claudius Academy is a small,
deliberately framework-free presentation engine — keep that in mind when
proposing changes.

## Project principles

- **No build step.** The project must keep working when you double-click
  `index.html`. Anything that requires `npm install` to _run_ the deck is a
  no-go. Tooling for _development_ (Playwright tests, type checking) is fine.
- **Engine and content are separate.** Anything generic goes under `js/` or
  `css/`. Anything talk-specific goes under `presentations/<deck>/`.
- **No new runtime dependencies.** Vanilla JS, vanilla CSS, vanilla HTML.
- **Configuration before code.** If a change can be made by editing
  `config.js` or `theme.css`, that's where it should land.

## Getting set up

```bash
git clone <this repo>
cd demo
npm install              # only needed for tests
npm run test:install     # one-time Playwright browser install
```

To preview the deck locally:

```bash
npm start                # python3 -m http.server 8000
# then visit http://localhost:8000
```

Or just open `index.html` directly — the dynamic deck loader works over
`file://` in modern browsers too.

## Running tests

```bash
npm test                 # headless
npm run test:headed      # headed (watch the browser drive itself)
npm run test:ui          # Playwright's interactive UI mode
```

CI runs the same suite on every push and pull request via
`.github/workflows/test.yml`.

## How to contribute

1. **Open an issue first** for anything non-trivial. A 30-second sanity check
   from a maintainer can save you an afternoon.
2. **Branch from `main`** with a short, descriptive name:
   `feature/timer-pause`, `fix/picker-keyboard`, `docs/readme-quickstart`.
3. **Keep changes scoped.** One PR = one concern. Refactors and features
   shouldn't ride along with bug fixes.
4. **Add or update tests.** Any new keybinding, slide builder, or modal needs
   a smoke test in `tests/` that exercises it through Playwright.
5. **Update the README and `types.d.ts`** when you add or rename anything in
   the public surface (slide builders, config keys, key bindings).
6. **Run the test suite locally** before pushing.
7. **Open a PR** with a clear description of _what_ and _why_. Reference the
   issue if there is one.

## Style

- Indentation: 2 spaces (enforced by `.editorconfig`).
- Module pattern: each engine file is a single IIFE that attaches one global.
- No comments that restate code. Comments explain _why_, not _what_.
- No emojis in source files unless the user explicitly asks for them.
- CSS: prefer CSS variables over hardcoded colors. New tokens go in
  `css/theme.css` so they can be overridden per deck.

## Adding a new slide builder

1. Add the builder to `js/builders.js` with a brief JSDoc block.
2. Register it on `window.Builders`.
3. Add corresponding CSS in a new `css/<name>.css` file (linked from
   `index.html`).
4. Add the builder's option type to `types.d.ts`.
5. Add at least one Playwright test in `tests/` exercising the new builder.
6. Add a row to the README's "Slide builders" table.
7. Add an example usage to `presentations/_template/deck.js`.

## Reporting bugs

Open an issue with:

- Browser + version
- Steps to reproduce
- What you expected vs what happened
- A screenshot or short screen recording if visual

## Asking for a feature

Open an issue describing the _use case_, not just the feature. "I want to
present in a co-pilot/audience layout" is more useful than "add a presenter
view."

## Code of conduct

Be kind. Disagreements happen — keep them about the code, not the person.
Maintainers reserve the right to close conversations that drift into
personal attacks.
