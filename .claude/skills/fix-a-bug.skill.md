---
name: fix-a-bug
description: Triage, reproduce, fix, and test a bug in the Claudius Academy engine — follows the project's "investigate before changing" rule and never skips the regression test.
---

# Skill: fix a bug

Use this when the user reports something broken in the engine or a deck.

## Read first

- `CLAUDE.md` — the hard rules (especially: never bypass `--is-active`,
  always update tests, no new runtime deps)
- The relevant engine module(s) for the area being reported
- `tests/` — to see how similar things are tested

## Steps

1. **Reproduce before theorising.**
   - Get the exact steps. Ask the user for: deck used, browser, the slide
     they were on, what they pressed/clicked, what they expected, what
     happened.
   - Open the page locally and walk the same steps. **Do not propose a fix
     until you've seen the bug yourself.** Speculative fixes for things you
     haven't reproduced are a recurring source of regressions in this repo.

2. **Find the root cause, not just a symptom.**
   - Read the actual code path. Don't grep-and-guess.
   - Common categories of bug we've already hit (and you should check
     against first):
     - **CSS specificity** — a `.slide--xxx { display: ... }` rule overriding
       `.slide { display: none }`. Always qualify with `.is-active`.
     - **Detached SVG measurement** — calling `getTotalLength()` on a path
       before `appendChild`. Safari returns 0.
     - **Modal hotkey collision** — a key intercepted while a modal is open
       breaking other shortcuts. See `js/nav.js` for the precedence order.
     - **Stale config** — the `hints` panel and other engine surfaces are
       overridden from `config.js`, not `index.html`. Update both, or just
       the config.
     - **Missing `is-active` qualifier** — see CSS specificity above.

3. **Write a failing test first** (when feasible).
   - Add a Playwright test in `tests/` that reproduces the bug and fails on
     `main`.
   - This locks the regression so it can't come back silently.
   - For visual-only bugs (a colour, a glow, an animation timing), a test
     may not be worth it — say so and document the manual repro steps in
     the PR/commit message.

4. **Fix the root cause.**
   - The minimal change. Don't refactor the surrounding area "while you're
     in there." Bug fixes should be reviewable in 30 seconds.
   - If the fix exposes a deeper design problem, surface it in the PR
     description and let the user decide whether to also do the bigger
     change.

5. **Run the full test suite.**
   ```bash
   npm test
   ```
   Confirm the new test passes and no others regressed.

6. **Smoke-test the deck manually.**
   - Open `index.html`, walk the slide that originally failed, plus a few
     adjacent ones to make sure your fix didn't shift state somewhere else.

7. **Update docs if the bug exposed a documentation gap.**
   - If a key binding wasn't listed, add it to the README and the `hints`
     array in every deck's `config.js`.
   - If a config option's behavior was unclear, clarify the comment in
     `presentations/<deck>/config.js`.

## Don't

- Don't fix multiple unrelated bugs in one change. Open separate PRs/commits.
- Don't disable or weaken a test "just to make CI green." If a test is
  wrong, fix the test and explain why in the commit message.
- Don't add `// eslint-disable` or `// @ts-ignore`-style escape hatches as
  the actual fix. They paper over real problems.
- Don't introduce a new global, a new dependency, or a new build step in
  the name of "the cleaner fix." The constraints are non-negotiable.
