# Live Note Parameters implementation plan

Goal: graduate the verified Demo to a maintainable, installable MVP.
Spec: `mvp-design.md`.

- [x] Core: add failing cases for Frontmatter, duplicate/conflicting declarations, minimal edits, rename/static-example boundaries, stale drafts and retained overrides; implement and run tests.
- [x] Host integration: add collapsible manager and editor transactions; adapt the existing inline copy icon without replacing its plugin; preserve field sizing and focus fixes.
- [x] Verification: run core checks and real-host dual-mode copy, input, isolation, management, undo/redo, source-integrity and plugin-coexistence probes.
- [x] Maintenance: document syntax, installation, upgrades, limits, troubleshooting and release procedure; add lockfile, CI, license, changelog and provenance.
- [x] Release: freeze source, build once, publish GitHub assets, install the same bytes in both vaults and record verified remote/download evidence.
- [x] Legacy source retirement: after the owner's explicit authorization, the exact 24-file Demo directory was removed; all nine historical evidence files were copied and byte-verified first, the original example note was retained, and the Dev host confirms only the formal plugin is installed and loaded.

Review focus: malformed/duplicate YAML; empty strings/quotes/CJK; changing defaults while another tab has overrides; stale drafts; third-party copy handlers; cached Reading DOM; private paths; composing text and undo boundaries.
