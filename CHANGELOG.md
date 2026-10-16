# Changelog

## Unreleased

## 0.1.1 — 2026-10-16

### Maintenance

- Clarify feature behavior and documentation maintenance requirements.
- Update release metadata and community distribution. Runtime behavior is unchanged.

## 0.1.0 — 2026-10-16

### Added

- Tab-local, memory-only parameter input in Live Preview and Reading.
- Frontmatter `doc_vars` defaults and a collapsible Live Preview manager with draft/save/cancel, add, rename, referenced-delete protection and reference actions.
- Explicit, previewed migration from legacy HTML-comment declarations.
- Existing native code-block copy and Copy Inline Code 2.1.0 icon adapters that resolve the current tab's values.
- Core, real-host interaction, layout and focus regression probes; reproducible build and immutable release packaging.

### Fixed

- Input width follows actual glyphs rather than character-count estimates.
- Focus outlines stay inside the input so adjacent quotes remain visible.
- Default changes retain existing temporary overrides for surviving parameters.
