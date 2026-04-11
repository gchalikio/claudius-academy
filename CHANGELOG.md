# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

### Added
- Vanilla-JS, no-build presentation engine.
- Slide router with hash routing, step-aware navigation, and localStorage
  position persistence.
- Slide builders: `textSlide`, `quoteSlide`, `sectionSlide`, `listSlide`,
  `splitSlide`, `compareSlide`, `bigTextSlide`, `imageSlide`, `diagramSlide`.
- Custom builder registration via `Builders.register()`.
- Progressive SVG diagram engine with curved arrows, ellipse/circle/rect
  nodes, and per-step play/unplay.
- Video modal (`V`), code snippet modal (`C`) with tab navigation,
  speaker notes (`N`), overview grid (`Esc`), talk timer (`T`).
- Default intro sequence (parchment + pixel) — fully overridable per deck.
- Per-deck configuration: branding, intro text, modal labels, hint panel,
  theme variables, font injection, optional per-deck CSS.
- Public/local deck registry split — personal decks live in
  `presentations/local/` (gitignored folder containing decks + registry).
- Friendly load-error overlay when a deck fails to resolve.
- Playwright smoke + integration tests covering boot, navigation, modals,
  overview, and the diagram engine.
- GitHub Actions CI running tests on every push and pull request.
- Editor type hints via `types.d.ts` (no build step required).
- AI-friendly layer: `CLAUDE.md` and `.claude/skills/` with three skills
  (`add-presentation`, `add-slide-builder`, `fix-a-bug`).

[Unreleased]: https://github.com/gchalikio/claudius-academy/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/gchalikio/claudius-academy/releases/tag/v0.1.0
