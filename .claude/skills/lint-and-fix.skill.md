---
name: lint-and-fix
description: Run all linters (ESLint, Prettier, markdownlint) and auto-fix every issue that can be fixed automatically — then surface anything that needs a human decision.
---

# Skill: lint and fix

Use this when the user wants a clean lint pass — typically before opening
a PR, before cutting a release, or just to catch up after a session of
fast iteration.

The repo uses three linters, each with a different scope:

- **Prettier** — formatting (JS, JSON, CSS, MD)
- **ESLint** — JS code-quality rules
- **markdownlint** — markdown structure

All three are dev dependencies. Running them never affects the deployed
site — they only touch source files.

## Read first

- `eslint.config.js` — the rules (plus the engine globals declaration)
- `.prettierrc.json` and `.prettierignore` — formatting + what's skipped
- `.markdownlint.json` and `.markdownlintignore` — markdown rules + skips
- `package.json` — the npm scripts

## Steps

1. **Make sure dev deps are installed.**
   If `node_modules/` doesn't exist, run:
   ```bash
   npm install
   ```
   (One-time per clone — the engine itself doesn't need it.)

2. **Run the auto-fixer first.**
   ```bash
   npm run fix
   ```
   This runs `eslint . --fix` followed by `prettier --write .`.
   It will rewrite files in place. Most spacing, quoting, semicolons,
   missing trailing commas, and unused-import warnings disappear here.

3. **Re-run the full lint suite.**
   ```bash
   npm run lint
   ```
   This runs ESLint + markdownlint + Prettier in *check* mode (no
   writes). Anything that's still red after the auto-fix is a real
   issue that needs human judgement.

4. **Triage the remaining issues by category.**

   - **ESLint `error` (red):** must be fixed before commit. Read the
     rule, read the code, decide between fixing the code or — only if
     the rule is genuinely wrong for this file — adding a narrowly
     scoped `// eslint-disable-next-line <rule>` with a comment
     explaining why.
   - **ESLint `warning` (yellow):** worth fixing but not blocking. Most
     are `no-unused-vars`. Either remove the unused thing, or rename it
     to start with `_` if it's an intentional placeholder.
   - **Prettier failures:** these should never reach this point — if
     they do, the auto-fix didn't run on those files. Re-run
     `prettier --write <file>`.
   - **Markdownlint failures:** usually MD040 (missing language on a
     fence — add `text` if there's no obvious one) or MD024 (duplicate
     heading — rename or restructure). If a rule is consistently wrong
     for the project, propose adding it to `.markdownlint.json` *with
     justification*, don't disable it case-by-case.

5. **For each remaining issue, fix or escalate.**
   - If it's mechanical (missing language tag, dead variable), just fix it.
   - If it requires a design decision (rename a function, split a file,
     change a public API), surface it to the user with the options
     before changing anything.

6. **Re-run `npm run lint` until it's clean.**
   Don't move on while anything is red.

7. **Run the test suite.**
   ```bash
   npm test
   ```
   The auto-fix can occasionally rewrite something the tests notice
   (e.g. trailing whitespace inside a `code` snippet that matters).
   Catch that here.

8. **Smoke-test in the browser.**
   Open `index.html?deck=examples` and walk a few slides. Lint passes
   don't catch behavioural breakage; this does.

9. **Commit the fixes.**
   - If the diff is small and obviously mechanical, one commit:
     `chore: lint --fix`.
   - If the diff is large because nothing has been formatted before,
     split into two commits so reviews are readable:
     1. `chore: prettier --write everything (no logic changes)`
     2. `chore: eslint --fix (no logic changes)`
   - Never mix lint fixes with feature changes in the same commit.

10. **Report back to the user with:**
    - What was auto-fixed (`<n>` files reformatted, `<m>` ESLint
      warnings cleared)
    - What remained and how it was resolved
    - Any rules you propose changing in `.markdownlint.json` /
      `eslint.config.js` (with justification)
    - A reminder to push if they want CI to verify

## Don't

- Don't mix lint fixes with feature commits. Reviewers can't tell
  signal from noise.
- Don't blanket-disable rules. If a rule is wrong, change it once with
  a justification comment. If it's right but the code is wrong, fix
  the code.
- Don't `--no-verify` past a hook to skip lint. The hook is the point.
- Don't run `npm run fix` on a dirty branch with uncommitted feature
  work — stash or commit first so the format pass stays clean.
- Don't add files to `.prettierignore` or `.eslintignore` to dodge a
  rule. Fix the file or change the rule.
- Don't ignore Prettier conflicts with ESLint. The repo uses
  `eslint-config-prettier` to disable conflicting rules — if you see
  one, the config is wrong and needs updating.
