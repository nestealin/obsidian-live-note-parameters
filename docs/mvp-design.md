# Live Note Parameters MVP

Editable parameters in ordinary Markdown, with persistent defaults and tab-local temporary overrides.

## Accepted behavior

- Plugin ID `live-note-parameters`, display name `Live Note Parameters`, MVP `0.1.0`.
- Frontmatter `doc_vars` is the persistent string mapping; `{{NAME}}` references parameters. Only fences marked `docvars` opt in; static examples remain literal.
- Live Preview and Reading support inline temporary editing, synchronization within one leaf, native code-block copy and the existing Copy Inline Code 2.1.0 icon.
- A new tab starts at defaults. Runtime input never writes notes, plugin data, local storage or workspace state.
- Live Preview provides a collapsible parameter manager: add, edit defaults, rename with reference preview, prevent deletion while referenced, locate and insert references, save/cancel.
- Definition changes use one editor history event. Preserve unrelated frontmatter/body. Detect stale definition drafts. Default changes retain existing overrides for surviving keys.
- Legacy HTML comments render for transition; explicit previewed migration removes the comment and creates `doc_vars`. Two declarations are an error.
- Text is single-line, at most 512 characters. No expression evaluation, network, command execution or automatic shell escaping.
- Desktop MVP tested on the current macOS Obsidian host; mobile and complex nested Markdown remain outside the accepted scope.

## Architecture

`src/core.cjs` owns YAML/Markdown ranges, validated edits and session reconciliation. `src/plugin.cjs` owns Obsidian/CodeMirror lifecycle, rendering, parameter UI and existing copy-button adapters. YAML is bundled; Obsidian and CodeMirror are host-provided modules. Only opened, permitted notes are accessed.

## Release acceptance

Core regressions, deterministic build, dual-mode real-host interaction, two-tab isolation, source bytes unchanged by runtime editing, copy compatibility, parameter maintenance/undo and unchanged existing plugin operation. Publish source, immutable release assets and checksums to GitHub; install the same assets into NesDev and NesVault.
