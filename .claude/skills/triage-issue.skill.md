---
name: triage-issue
description: Take a local bug or issue description from the user, classify it (type + priority), find the relevant files, propose a solution with tradeoffs, then apply it after the user confirms.
---

# Skill: triage an issue (local)

Use this when the user describes a bug or issue **conversationally** —
not from a GitHub issue. The goal is to turn a vague description into a
classified, located, and (optionally) fixed problem, with the user in
the loop on the chosen solution.

For GitHub issues with a URL or number, use `work-github-issue` instead.
For a known bug you're already fixing, use `fix-a-bug`.

## Read first

- `CLAUDE.md` — the hard rules and the public API surface
- `.github/labels.yml` — the type/priority/status label catalog
- The relevant engine module(s) once you know the area
- `tests/` — to see how similar things are tested

## Steps

1. **Get a real description.**
   If the user only said "X is broken", ask for:
   - Exact reproduction steps
   - The deck they were using
   - Browser + version
   - Expected vs actual
   - Console errors
   Do not start investigating until you have these. Speculative
   investigation wastes time.

2. **Reproduce locally.**
   Open the page, follow the steps, see the bug yourself. **If you can't
   reproduce, stop and ask the user for more info.** Don't try to fix
   what you can't see.

3. **Classify type.** Pick exactly one from `.github/labels.yml`:
   - `type/bug` — broken behaviour
   - `type/feature` — new functionality
   - `type/docs` — README, CLAUDE.md, skills
   - `type/refactor` — restructure with no behaviour change
   - `type/perf` — performance
   - `type/test` — test additions/fixes
   - `type/chore` — repo housekeeping

4. **Classify priority.** Pick exactly one:
   - `priority/critical` — main is broken, talk-blocking, data loss
   - `priority/high` — degrades a common flow, fix in days
   - `priority/medium` — annoying but not blocking
   - `priority/low` — nice to have

   **Rule of thumb:** if you can't justify "critical" to a colleague in
   one sentence, it's not critical.

5. **Locate the relevant files.**
   Use `Grep` for symbol names from the bug report. Use `Glob` for file
   patterns. Common locations:
   - Slide rendering bugs → `js/builders.js`, `js/router.js`,
     the relevant `css/<slide-type>.css`
   - Key binding bugs → `js/nav.js`
   - Modal bugs → `js/modal.js`, `js/code.js`, `js/overview.js`
   - Diagram bugs → `js/diagram.js`
   - Theme bugs → `css/theme.css`, `presentations/<deck>/theme.css`
   - Loader/picker bugs → `js/loader.js`, `presentations/index.js`

6. **Find the root cause, not just a symptom.**
   Read the actual code path. Walk the function calls. The most common
   categories of bug in this repo:
   - **CSS specificity** — `.slide--xxx { display: ... }` overriding
     `.slide { display: none }` without `.is-active` qualifier
   - **Detached SVG measurement** — `getTotalLength()` before `appendChild`
   - **Modal hotkey collision** — key intercepted while a modal is open
   - **Stale config surface** — hints panel in both `index.html` AND
     `config.js` getting out of sync
   - **Missing test for a regression-prone area**

7. **Propose 1–3 solutions to the user, with tradeoffs.**
   Format:
   ```
   Option A — <one-line description>
     Pros: <...>
     Cons: <...>
     Touches: <files>

   Option B — <...>
     ...
   ```
   **Wait for the user to pick one before changing any code.** If
   there's an obvious right answer, say so and mark it as your
   recommendation, but still wait for the OK on non-trivial changes.

8. **Apply the chosen solution.**
   Make the minimal change. Don't refactor surrounding code "while
   you're in there." If the fix exposes a deeper design problem,
   surface it but don't fix it in the same change.

9. **Add or update a test in `tests/`.**
   For most bugs this means a new Playwright test that fails on `main`
   and passes after the fix. For visual-only bugs, a test may not be
   feasible — say so explicitly and document the manual repro instead.

10. **Run the test suite.**
    ```bash
    npm test
    ```
    Confirm the new test passes and nothing else regressed.

11. **Smoke-test in the browser.**
    Walk the original repro steps. Walk a few adjacent slides. Confirm
    the bug is gone and you didn't break anything else.

12. **Report back to the user with a summary:**
    - **Type:** `type/<x>`
    - **Priority:** `priority/<x>`
    - **Root cause:** one sentence
    - **Fix:** one sentence
    - **Tests added:** which file, what it checks
    - **Suggested next step:** if this should be a public PR, say so —
      they can re-run as `work-github-issue` to ship it.

## Don't

- Don't propose a fix before reproducing the bug yourself.
- Don't apply a fix without asking when there's more than one valid
  option. The user owns the design decisions.
- Don't classify everything as `priority/high`. Most things are medium.
- Don't skip the test. If you can't write one, say *why* — don't just
  ship the fix.
- Don't refactor adjacent code as part of the fix. One concern per change.
