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

   **The hard rule for this skill: always fix the code, never disable
   the rule.** No `// eslint-disable-next-line`, no removals from
   `.markdownlint.json`, no `prettier-ignore` comments. If a rule is
   firing, the code is wrong (or the rule is wrong for the whole
   project, in which case escalate — see step 5).

   - **ESLint `error` (red):** read the rule, read the code, fix the
     code so the rule passes.
   - **ESLint `warning` (yellow):** same — fix it. Most are
     `no-unused-vars` (remove the dead thing, or rename to `_name` if
     it's an intentional placeholder).
   - **Prettier failures:** auto-fix didn't run on those files. Run
     `prettier --write <file>` and they'll vanish.
   - **Markdownlint failures:** fix the markdown. Common ones:
     - `MD040` — missing language on a fence. Add the right one
       (`js`, `bash`, `text`, `md`, `yaml`, etc.).
     - `MD031` — blank lines around fences. Add them.
     - `MD060` — table column alignment. Use `markdownlint-cli2 --fix`.
     - `MD024` — duplicate heading. Rename or restructure.

5. **For each remaining issue, fix or escalate — but never disable.**
   - If it's mechanical (missing language tag, dead variable, blank
     lines around a fence), just fix it.
   - If it requires a design decision (rename a function, split a file,
     change a public API), surface it to the user with the options
     before changing anything.
   - If a rule is genuinely wrong for the *whole project* (not just one
     spot), surface it to the user with: which rule, why it doesn't
     fit, and a proposed *configuration* (e.g. raising MD013's
     `line_length` parameter, not disabling MD013). The user decides
     whether to accept that config change. **Default is to fix the
     code, not the rule.**

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

9. **Report back to the user with:**
   - What was auto-fixed (`<n>` files reformatted, `<m>` ESLint
     warnings cleared)
   - What remained and how it was resolved
   - The exact commit message you'd suggest if they want to commit
   - **Do NOT commit.** Per the global rule in `CLAUDE.md`, no skill
     creates commits without explicit user confirmation. If the user
     says "commit it" or "commit and push," then and only then run the
     commit — and even then, show the message first and wait for OK.
   - Suggested commit shape (when the user does ask):
     - If the diff is small/mechanical: one commit, `chore: lint --fix`
     - If the diff is large: split into two commits, prettier first,
       eslint second, so reviews stay readable
     - Never mix lint fixes with feature changes in the same commit

## Don't

- **Don't commit.** No skill commits or pushes without explicit user
  permission per operation. Suggest the commit message; wait for OK.
- **Don't disable a lint rule to make a warning go away.** Ever.
  The fix is always in the code. If a rule is genuinely wrong for the
  whole project, surface it to the user with a justification and let
  them decide whether to *configure* (not disable) it.
- Don't mix lint fixes with feature commits. If the user does ask you
  to commit, keep it scoped.
- Don't `--no-verify` past a hook to skip lint. The hook is the point.
- Don't run `npm run fix` on a dirty branch with uncommitted feature
  work — stash first so the format pass stays clean and reviewable.
- Don't add files to `.prettierignore` or `.eslintignore` to dodge a
  rule. Fix the file.
- Don't ignore Prettier/ESLint conflicts. The repo uses
  `eslint-config-prettier` to silence conflicting ESLint rules — if
  you see one fire, the config is wrong and needs updating, not the
  symptom.
