---
name: work-github-issue
description: End-to-end GitHub issue worker — fetches an issue, classifies it with type+priority labels, finds and applies a fix, opens a PR linking the issue, comments back with the PR link, and updates labels on both.
---

# Skill: work a GitHub issue

Use this when the user gives a GitHub issue number or URL and wants the
issue handled all the way through to a PR. The skill assumes the user
has `gh` CLI authenticated for the `gchalikio/claudius-academy` repo.

For purely local triage (no GitHub round-trip), use `triage-issue`.
For known bugs you're already fixing, use `fix-a-bug`.

## Read first

- `CLAUDE.md` — hard rules and public API surface
- `.github/labels.yml` — the label catalog
- `CONTRIBUTING.md` — branch naming, PR rules
- `tests/` — to see how similar things are tested

## Prerequisites

```bash
gh auth status
```
If `gh` isn't authenticated, ask the user to run `gh auth login` before
proceeding.

## Steps

1. **Fetch the issue.**
   ```bash
   gh issue view <number> --json number,title,body,labels,state,author,comments
   ```
   Read the title, body, every comment, and the existing labels.
   If the issue is closed, stop and ask the user whether to reopen.

2. **Acknowledge the issue with a triage comment.**
   ```bash
   gh issue comment <number> --body "Picking this up — investigating now."
   ```
   Apply the `status/in-progress` label:
   ```bash
   gh issue edit <number> --add-label "status/in-progress" --remove-label "status/needs-triage"
   ```

3. **Classify type and priority** if the issue doesn't already have them.
   Pick one type and one priority from `.github/labels.yml`. Apply both:
   ```bash
   gh issue edit <number> --add-label "type/<x>" --add-label "priority/<x>"
   ```
   See `triage-issue` for how to pick.

4. **Reproduce locally.**
   Open the page, follow the issue's repro steps. **If you can't
   reproduce, comment on the issue asking for more info, apply the
   `status/needs-info` label, remove `status/in-progress`, and stop.**
   Don't fix what you can't see.

5. **Find the root cause.**
   Same approach as `triage-issue` step 6 — read the actual code path,
   check the common bug categories, locate the relevant files.

6. **Decide the approach.**
   - For a small/obvious fix (typo, missing key in hints, single CSS
     specificity bug), proceed directly.
   - For anything non-trivial, comment on the issue with the proposed
     approach and wait for thumbs-up before writing code. Vague issues
     deserve a sketch in the issue thread before a PR appears.

7. **Create a branch.**
   Use the convention `<type>/<short-description>`, where `<type>` is
   one of `fix`, `feat`, `docs`, `refactor`, `perf`, `test`, `chore`:
   ```bash
   git checkout -b fix/picker-keyboard-loop
   ```

8. **Apply the fix.**
   Minimal change. No drive-by refactors. Follow the same hard rules
   as `fix-a-bug` and `add-feature`.

9. **Add or update a test in `tests/`.**
   The test should fail on `main` and pass after the fix. For
   visual-only bugs, document the manual repro in the PR description
   instead.

10. **Run the test suite.**
    ```bash
    npm test
    ```
    Don't move on until everything passes.

11. **Commit.**
    ```bash
    git add <files>
    git commit -m "$(cat <<'EOF'
    fix: <short description>

    <2-3 sentence explanation of what was wrong and how this fixes it>

    Fixes #<issue-number>

    Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
    EOF
    )"
    ```
    Use `feat:` / `docs:` / `refactor:` / `perf:` / `test:` / `chore:`
    instead of `fix:` for non-bug work.

12. **Push the branch.**
    ```bash
    git push -u origin fix/picker-keyboard-loop
    ```

13. **Open a PR.**
    ```bash
    gh pr create \
      --title "fix: <short description>" \
      --body "$(cat <<'EOF'
    ## What

    <one-line summary>

    ## Why

    Fixes #<issue-number>. <2-3 sentence explanation.>

    ## How to test

    - [ ] Open `index.html`, walk the affected slide(s)
    - [ ] `npm test` passes
    - [ ] <any specific manual check>

    🤖 Generated with [Claude Code](https://claude.com/claude-code)
    EOF
    )"
    ```
    Capture the PR URL from the output.

14. **Apply labels to the PR** matching the issue:
    ```bash
    gh pr edit <pr-number> --add-label "type/<x>" --add-label "priority/<x>"
    ```

15. **Comment on the issue with the PR link.**
    ```bash
    gh issue comment <issue-number> --body "Opened #<pr-number> with a fix — please take a look."
    ```

16. **Report back to the user with a summary:**
    - Issue: `#<n>` "<title>"
    - Type: `type/<x>` · Priority: `priority/<x>`
    - Branch: `<branch-name>`
    - PR: `<pr-url>`
    - Tests added: which file, what it checks
    - Anything the user should manually verify before merging

## Don't

- Don't push directly to `main`. Always work on a branch + PR.
- Don't `git push --force` to a branch the user didn't create. The user
  owns force pushes; flag a need for one and let them do it.
- Don't merge the PR yourself unless the user explicitly asks. Approval
  + merge is the user's call.
- Don't close the issue manually. The PR's `Fixes #N` line will close it
  on merge.
- Don't apply `priority/critical` to anything you didn't reproduce in
  under 60 seconds. Critical means *obviously, immediately broken*.
- Don't skip the issue comment. The reporter deserves to know what
  happened to their report.
- Don't comment "fixed" without linking the PR. Actionable links beat
  status updates.
- Don't fix multiple unrelated issues in one PR. One issue, one PR.
