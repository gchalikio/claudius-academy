---
name: cut-release
description: Cut a tagged release of the engine — bumps the version, updates CHANGELOG, commits, tags, pushes, and lets the release workflow create the GitHub release automatically.
---

# Skill: cut a release

Use this when the user wants to publish a new version of the engine
(not a deck — decks aren't versioned). The release workflow at
`.github/workflows/release.yml` handles the GitHub release page; this
skill handles the local steps that trigger it.

## Read first

- `CHANGELOG.md` — current state, with the `[Unreleased]` section
- `package.json` — current version
- `.github/workflows/release.yml` — what fires when you push a tag
- `CONTRIBUTING.md` — to confirm any release rules

## Steps

1. **Confirm the bump type with the user.**
   The project follows [Semantic Versioning](https://semver.org/):
   - **patch** (`0.1.0 → 0.1.1`) — bug fixes only
   - **minor** (`0.1.0 → 0.2.0`) — new features, no breaking changes
   - **major** (`0.1.0 → 1.0.0`) — breaking changes (slide config shape,
     keybindings removed, builders removed)
   If the user is unsure, look at the `[Unreleased]` section of
   `CHANGELOG.md` and decide based on the contents.

2. **Verify a clean working tree.**
   ```bash
   git status
   ```
   Stop and ask if there are uncommitted changes. Don't release a dirty
   tree — the tag will capture WIP.

3. **Verify all tests pass.**
   ```bash
   npm test
   ```
   Do not release on a red build. If anything fails, switch to the
   `fix-a-bug` skill.

4. **Update `CHANGELOG.md`.**
   - Move everything under `[Unreleased]` into a new `## [<new-version>]`
     section above it.
   - Add today's date in ISO format: `## [0.2.0] - 2026-04-12`
   - Add a fresh empty `[Unreleased]` section at the top.
   - Update the link references at the bottom of the file:
     ```md
     [Unreleased]: https://github.com/gchalikio/claudius-academy/compare/v0.2.0...HEAD
     [0.2.0]: https://github.com/gchalikio/claudius-academy/compare/v0.1.0...v0.2.0
     ```

5. **Bump the version in `package.json`.**
   Change the `"version"` field manually (don't run `npm version` — it
   creates its own tag and we want control over that).

6. **Commit the bump.**
   ```bash
   git add CHANGELOG.md package.json
   git commit -m "release: v<new-version>"
   ```

7. **Tag and push.**
   ```bash
   git tag v<new-version>
   git push origin main
   git push origin v<new-version>
   ```

8. **Watch the release workflow.**
   The push of a `v*` tag triggers `.github/workflows/release.yml`. It
   extracts the matching section from `CHANGELOG.md` and creates a
   GitHub release. Confirm in the **Actions** tab that it succeeded.
   Confirm in the **Releases** tab that the release exists with the
   right notes.

9. **If the release workflow fails**, do NOT delete the tag and re-push.
   Instead:
   - Open the workflow log, fix the underlying issue.
   - Run the workflow manually if it supports `workflow_dispatch`,
     OR delete the GitHub release (not the tag) and create it manually
     via `gh release create`.

## Don't

- Don't release on a dirty working tree.
- Don't release on a red build.
- Don't skip the CHANGELOG update. The release workflow reads from it.
- Don't bump major version casually — make sure breaking changes really
  are breaking. Renaming a slide builder = breaking. Adding a builder = not.
- Don't push the tag before pushing the commit. The release notes script
  reads `CHANGELOG.md` from the tag.
- Don't `git tag --force` to "fix" a tag. Cut a new patch instead.
