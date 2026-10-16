# 0.1.0 acceptance

Verified on 2026-10-16, macOS / Obsidian 1.13.7, with Copy Inline Code 2.1.0.

| Gate | Result |
| --- | --- |
| Core and release metadata | 21 passed |
| Live Preview parameter management | 21 checks passed, including default edits, preserved overrides, rename, referenced-delete protection, cancel, native undo/redo, stale drafts, manual YAML refresh and explicit legacy migration |
| Dual-mode runtime and copy compatibility | 23 checks passed |
| Actual input geometry | 12 cases passed, including CJK, proportional glyphs and empty values |
| Focus/selection and adjacent quotes | Both modes passed; original quotes remain present in copied commands |
| Source integrity | Runtime edits did not change the fixture; definition tests restored the dedicated fixture through its editor and waited for disk confirmation |
| Host errors | No errors captured |
| Runtime dependency audit | No known advisories reported for the pinned production dependencies |

Runtime receipts, screenshots and install evidence live in gitignored project data. Public provenance contains source commit/tree IDs and a portable baseline manifest. These results cover the stated desktop host; physical IME, mobile, pop-out windows, all themes and all plugin combinations are not implied.
